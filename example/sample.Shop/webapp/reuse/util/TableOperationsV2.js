sap.ui.define([
        "sap/ui/base/Object",
    	"nw/epm/refapps/shop/reuse/util/TableOperationsImpl"
    ], function(Object, TableOpImp) {
	"use strict";

	return Object.extend("nw.epm.refapps.shop.reuse.util.TableOperationsV2", {
		// This oject provides functions to faciliate sorting, filtering, grouping and seraching of tables.
		// The following features are provided:
		// - usage of SmartFilterBar filters (multi filter) together with simple sap.ui.model.Filter
		// - a fixed filter can be provided which (if present) is applied to all bindings.
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
		// The implementation of most functions is delegates to class TableOperationsImpl. The documentation of these 
		// functions can be found in TableOperationsImpl.
		// TableOperationsImpl provides grouping, filtering and sorting functionality. It is not meant to be consumed 
		// directly by apps. Instead interface classes like TableOperations are provided for consumption in apps..

		constructor: function(oTable, aSearchableFields, oDefaultSorter, oFixedFilter) {
			// Storage of the active grouping and sorting is private because
			// of their interdependency
			var	oTableOpImp = new TableOpImp({
				oTable: oTable,
				aSearchableFields: aSearchableFields,
				oDefaultSorter: oDefaultSorter,
				oFixedFilter: oFixedFilter
			});

			this.addSorter = function(oSorter) {
				oTableOpImp.addSorter(oSorter);
			};

			this.setGrouping = function(oNewGrouper) {
				oTableOpImp.setGrouping(oNewGrouper);
			};

			this.removeGrouping = function() {
				oTableOpImp.removeGrouping();
			};

			this.getGrouping = function() {
				return oTableOpImp.getGrouping();
			};

			this.getSorter = function() {
				return oTableOpImp.getSorters();
			};

			this.addFilter = function(oFilter, sFilterAttribute) {
				oTableOpImp.addFilter(oFilter, sFilterAttribute);
			};

			this.getFilterTable = function() {
				return oTableOpImp.getFilterTable();
			};

			this.resetFilters = function() {
				oTableOpImp.resetFilters();
			};

			this.setSearchTerm = function(sNewSearchTerm) {
				oTableOpImp.setSearchTerm(sNewSearchTerm);
			};

			this.getSearchTerm = function() {
				return oTableOpImp.getSearchTerm();
			};

			this.addSFBFilters = function(oSFBFilters) {
				oTableOpImp.addSFBFilters(oSFBFilters);
			};

			this.applyTableOperations = function(bUseApplicationFilters) {
				oTableOpImp.applyTableOperations(bUseApplicationFilters);
			};
		}
	});
});