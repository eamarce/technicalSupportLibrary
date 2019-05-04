sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Object, Sorter, Filter, FilterOperator) {
	"use strict";

	return Object.extend("nw.epm.refapps.shop.reuse.util.TableOperationsImpl", {
		// This oject provides functions to faciliate sorting, filtering, grouping and seraching of tables.
		// The following features are provided:
		// - usage of SmartFilterBar filters (multi filter) together with simple sap.ui.model.Filter
		// - Sorting : It is ensured that setting a new sorter with "sort list" does not break a sorting 
		//   that was previously set by "grouping". When the list is sorted or grouped the list of sorters that
		//   is applied to the binding is built by concatenating this.oGrouper and aSortList of this object
		//   into one array. Sorting and grouping is done with the following rules:
		//   1. selecting a sorter on the table adds the new sorter as the main sorter to all existing sorters
		//   2. if grouping and sorting are both set for the same attribute then the direction 
		//   (ascending/descending) is aligned
		// - searching is done using filters (one filter per searcheable column)
		// - all changes to the filtering and sorting of a table are collected and applied togeher when 
		//  function applyTableOperations is called
		// Please note that TableOperationsImpl is not meant to be consumed directly by apps.
		// Instead interface classes like TableOperationsV2 are provided for consumption in apps.

		constructor: function(oSettings) {
			// currently the following properties of oSettings are evaluated:
			// oTable - this is the table on which the operations are performed
			// aSearchableFields - array of column names in which searches are performed
			// oDefaultSorter - The default sorter (type sap.ui.model.Sorter). That is used for the inital sorting of the table
			this.sSearchTerm = ""; // contains the search term of the currently active search
			this.oGrouper = null; // currently active grouper of type  "sap.ui.model.Sorter",
			this.aSearchFilter = []; // contains the filters for the current search. There is one filter per searcheable columen
			this.aFilterList = []; // list of active filters (except for search filter)
			this.oFixedFilter = oSettings.oFixedFilter;
			this.bGroupingChanged = false; //indicator grouping changed since the last binding update
			this.bSearchChanged = false; //indicator search changed since the last binding update
			this.bFilterChanged = !!this.oFixedFilter; //indicator filter changed since the last binding update
			this.bSortChanged = true; //indicator sort changed since the last binding update
			this.aSortList = [oSettings.oDefaultSorter || new Sorter("Name", false)];
			// List of active sorters (excluding the grouping sorter). Adefault sorter can be provided 
			// in the 
			this.oTable = oSettings.oTable; //the table that is to be sorted, filtered, etc. taken from the import parameter
			this.oFilterDict = {}; // dictionary object containing one attribute for each column having at least one filter.
			// EachAttribute consists of two lists. One for the exclding filters (NE) and one for the
			// includign filters (EQ, BT,...)
			this.aSearchableFields = oSettings.aSearchableFields || []; //List of searchable
			// columns - taken from the import parameter
		},

		addFilter: function(oFilter, sFilterAttribute) {
			// This function creaets one list containing the filters for all attributes. In this list there is 
			// one multiFilter for each attribute. The multiFilters contain two separate lists for including
			// and excluding filters. The including filters for one attribute are connect by the "or" 
			// operator and the exluding filters are connect by the "and" operator. The two lists are connected
			// by the "and operator"
			if (oFilter && sFilterAttribute) {
				if (this.oFilterDict[sFilterAttribute]) {
					// there is already at least one filter for this attribute -> add the new filter to the 
					// appropriate list depending on its filter operator
					// currently "not equal" is the only possible excluding filter operator
					if (oFilter.sOperator === FilterOperator.NE) {
						this.oFilterDict[sFilterAttribute].excludingFilters.push(oFilter);
					} else {
						this.oFilterDict[sFilterAttribute].includingFilters.push(oFilter);
					}
				} else {
					// there is no filter for this attribute yet -> add the new filter attribute to the dictionary
					this.oFilterDict[sFilterAttribute] = {
						includingFilters: [],
						excludingFilters: []
					};
					// currently "not equal" is the only possible excluding filter operator
					if (oFilter.sOperator === FilterOperator.NE) {
						this.oFilterDict[sFilterAttribute].excludingFilters = [oFilter];
					} else {
						this.oFilterDict[sFilterAttribute].includingFilters = [oFilter];
					}
				}
				// now merge the filters for all attributes into one list
				this.aFilterList.length = 0;
				for (var prop in this.oFilterDict) {
					if (this.oFilterDict.hasOwnProperty(prop)) {
						var aFilterListForProp = [];
						if (this.oFilterDict[prop].includingFilters.length > 0) {
							aFilterListForProp.push(new Filter(this.oFilterDict[prop].includingFilters, false));
						}
						if (this.oFilterDict[prop].excludingFilters.length > 0) {
							aFilterListForProp.push(new Filter(this.oFilterDict[prop].excludingFilters, true));
						}
						this.aFilterList.push(new Filter(aFilterListForProp, true));
					}
				}
				this.bFilterChanged = true;
			}
		},

		addSorter: function(oSorter) {
			// adds the new sorter as the new main sorter to the list of active sorters.
			// Delete any existing sorter for the path specified
			var i = this._getSortListIndexByPath(oSorter.sPath);
			if (i !== -1) {
				this.aSortList.splice(i, 1);
			}
			// The latest sorter is always the "main" sorter -> add it to the
			// beginning of the array
			this.aSortList.unshift(oSorter);
			// Copy the sort order of the new sorter to the grouper if they
			// refer to the same path
			if (this.oGrouper && this.oGrouper.sPath === oSorter.sPath) {
				this.oGrouper.bDescending = oSorter.bDescending;
			}
			this.bSortChanged = true;
		},

		addSFBFilters: function(oSFBFilters) {
			// This method evaluates the filter description of the smart filter bar and creates filter objects according to the description.
			// By calling function addFilter the smartFilterBar filters are added to the filter dictionary and to list of active filters.
			var sFilterOperation = "";
			for (var prop in oSFBFilters) {
				//make sure that only the public own properties ae used here
				if (!oSFBFilters.hasOwnProperty(prop) || prop.startsWith("_")) {
					continue;
				}
				//create the filter an add it to the active filters by calling addFilter 
				if (oSFBFilters[prop].ranges) {
					for (var i = 0; i < oSFBFilters[prop].ranges.length; i++) {
						sFilterOperation = oSFBFilters[prop].ranges[i].operation;
						//when single values are excluded the operator needs to be switched to "not equal" 
						sFilterOperation = (sFilterOperation === FilterOperator.EQ && oSFBFilters[prop].ranges[i].exclude) ? FilterOperator.NE :
							sFilterOperation;
						this.addFilter(new Filter(oSFBFilters[prop].ranges[i].keyField, sFilterOperation, oSFBFilters[prop].ranges[
								i].value1, oSFBFilters[prop].ranges[i].value2),
							oSFBFilters[prop].ranges[i].keyField);
					}
				}
				if (oSFBFilters[prop].items) {
					for (var j = 0; j < oSFBFilters[prop].items.length; j++) {
						this.addFilter(new Filter(prop, FilterOperator.EQ, oSFBFilters[prop].items[j].key),
							prop);
					}
				}
			}
		},

		applyTableOperations: function(bUseApplicationFilters) {
			// Here the binding of the table items is updated with the currently active sorters and filters.
			// It is assumed that all changes done by the user are immediately reflected in the table.
			// That means there is always just one change at a time. 
			var aActiveSorters = [],
				aActiveFilters = this.oFixedFilter ? [this.oFixedFilter] : [],
				oTableBinding = this.oTable.getBinding("items"),
				sFilterType = bUseApplicationFilters ? sap.ui.model.FilterType.Application : sap.ui.model.FilterType.Control;
				

			if (oTableBinding) {
				if (this.bGroupingChanged || this.bSortChanged) {
					// The grouping or sorting of the table has changed. The sorting on the binding needs to be updated.
					// Note that the sorter of the grouping has to be the first one in the list of sorters that is added
					// to the binding
					if (this.oGrouper) {
						aActiveSorters.push(this.oGrouper);
					}
					if (this.aSortList.length > 0) {
						aActiveSorters = aActiveSorters.concat(this.aSortList);
					}
					oTableBinding.sort(aActiveSorters);
				}
				if (this.bSearchChanged || this.bFilterChanged) {
					//the filters that origin from entries in a sarch field and the ones that are set e.g. by a
					// filter bar need to be applied together.
					// Note that if the search is done in more than one column then the corresponding filters have
					// to be connected using "or". All other filters are connected using "and" logic.

					if (this.aSearchFilter.length > 0) {
						aActiveFilters.push(new Filter(this.aSearchFilter, false));
					}
					if (this.aFilterList.length > 0) {
						aActiveFilters.push(new Filter(this.aFilterList, true));
					}

					if (aActiveFilters.length > 0) {
						oTableBinding.filter(new Filter(aActiveFilters, true), sFilterType);
					} else {
						oTableBinding.filter();
					}
				}
				this._resetChangeIndicators();
			}
		},

		getSearchFilters: function() {
			// Searching is done using filters. This function returns the list of filters which are used to perform a
			// search. During a serach the list contains one filter per searchable column (the search filters are 
			// created in function setSearchTerm)
			return this.aSearchFilter;
		},

		getSearchTerm: function() {
			// returns the currently active search term
			return this.sSearchTerm;
		},

		_getSortListIndexByPath: function(sPath) {
			// searches the list of active sorters for a sorter with the given path and returns the sorter's position
			// in the list (there can be only one) or -1 if no matching sorter was found 
			var i;
			for (i = 0; i < this.aSortList.length; i++) {
				if (this.aSortList[i].sPath === sPath) {
					return i;
				}
			}
			return -1;
		},

		getGrouping: function() {
			// returns the the currently active grouping sorter
			return this.oGrouper;
		},

		getSorters: function() {
			// returns the list of currently active sorters (sorters for searches and for grouping are not part of this list)
			return this.aSortList;
		},

		getFilterTable: function() {
			// returns the list of currently acive filters
			return (this.aFilterList && this.aFilterList.length > 0) ? this.aFilterList : null;
		},

		resetFilters: function() {
			// removes all active filters 
			this.aFilterList.length = 0;
			this.oFilterDict = {};
			this.bFilterChanged = true;
		},

		removeGrouping: function() {
			// removes the active grouping sorter
			this.oGrouper = null;
			this.bGroupingChanged = true;
		},

		setGrouping: function(oNewGrouper) {
			// If there is already a sorter for the path specified, the sorting order
			// must be the same as in the new grouper
			var i = this._getSortListIndexByPath(oNewGrouper.sPath);
			if (i !== -1) {
				this.aSortList[i].bDescending = oNewGrouper.bDescending;
			}
			this.oGrouper = oNewGrouper;
			this.bGroupingChanged = true;
		},

		setSearchTerm: function(sNewSearchTerm) {
			// Searching may be done in more than one column - therefore a filter for 
			// each of the searchable columns has to be created
			this.aSearchFilter.length = 0;
			if (sNewSearchTerm && sNewSearchTerm.length > 0) {
				this.sSearchTerm = sNewSearchTerm;
				for (var i = 0; i < this.aSearchableFields.length; i++) {
					this.aSearchFilter.push(new Filter(this.aSearchableFields[i], FilterOperator.Contains, sNewSearchTerm));
				}
			} else {
				//the search term is empty -> remove the search
				this.sSearchTerm = "";
				this.aSearchFilter.length = 0;
			}
			this.bSearchChanged = true;
		},

		_resetChangeIndicators: function() {
			// after all pending changes are executed the change indicators need to be reset.
			// this is done here
			this.bGroupingChanged = false;
			this.bSearchChanged = false;
			this.bFilterChanged = false;
			this.bSortChanged = false;
		}
	});
});