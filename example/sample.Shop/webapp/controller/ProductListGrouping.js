sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/Sorter"
    ], function(Object, Sorter) {
	return Object.extend("nw.epm.refapps.shop.controller.ProductListGrouping", {
		_oResourceBundle: null,
		_oTableOperations: null,
		_oView: null,
		_oGroupDialog: null,

		constructor: function(oTableOperations, oView) {
			var oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(oView));
			this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
			this._oTableOperations = oTableOperations;
			this._oView = oView;
		},

		openGroupingDialog: function() {
			if (!this._oGroupDialog) {
				this._oGroupDialog = sap.ui
					.xmlfragment("nw.epm.refapps.shop.view.fragment.ProductGroupingDialog", this);
					this._oView.getController().attachControl(this._oGroupDialog);
			}
			this._oGroupDialog.open();
		},

		// Handler for the Confirm button of the grouping dialog. Depending on the selections made in the
		// dialog, the respective sorters are created and stored in the _oTableOperations object.
		// The actual setting of the sorters on the binding is done in function applyTableOperations of the
		// TableSearchHelper object.
		onGroupingDialogConfirmed: function(oEvent) {
			var mParams = oEvent.getParameters(),
				sSortPath, sFunctionName;
			if (mParams.groupItem) {
				sSortPath = mParams.groupItem.getKey();
				sFunctionName = sSortPath[0].toLowerCase() + sSortPath.slice(1);
				this._oTableOperations.setGrouping(new Sorter(sSortPath, mParams.groupDescending, (this._oGroupFunctions[sFunctionName].bind(this))));
			} else {
				this._oTableOperations.removeGrouping();
			}
			this._oTableOperations.applyTableOperations();
		},
		// This is a generic grouping function for columns that contain strings. For those columns, the property's value is
		// used as the grouping key and the group header text is built using the column's label and the property's value.
		_getNameGrouper: function(sName, oListItemContext) {
			var sLabel = oListItemContext.getModel().getProperty("/#Product/" + sName + "/@sap:label");
			var sText = this._oResourceBundle.getText("xfld.groupingLabel", [sLabel, (oListItemContext.getProperty(sName))]);
			return {
				key: oListItemContext.getProperty(sName),
				text: sText
			};
		},

		// The group functions are called during grouping for each item in the list. They determine which group
		// each list item belongs to. Items with the same key form a group. A new key
		// means a new group. The returned text is used as the label of the group item header.
		_oGroupFunctions: {
			// Grouping function for grouping by rating.
			// Split is done because grouping is done with integer values, decimal places are not needed.
			averageRating: function(oListItemContext) {
				var iRating = parseInt(oListItemContext.getProperty("AverageRating"), 10),
					sText = "";
				if (iRating === 0) {
					sText = this._oResourceBundle.getText("xfld.groupNoRating");
				} else if (iRating > 0 && iRating < 5) {
					sText = this._oResourceBundle.getText("xfld.groupRatingBetween", [iRating, iRating + 1]);
				} else if (iRating === 5) {
					sText = this._oResourceBundle.getText("xfld.groupRating", [iRating]);
				} else {
					// Do not forget the fallback - note that in this example, the fallback can never be reached.
					sText = "?";
				}
				return {
					key: iRating,
					text: sText
				};
			},
			// Grouping function for grouping by price - Assumption: all prices have the same currency code; currency
			// conversion is done in the back end of each app and is not part of this app.
			price: function(oListItemContext) {
				var sKey, sText, iPrice = Number(oListItemContext.getProperty("Price"));
				if (iPrice <= 100) {
					sKey = "LE100";
					sText = this._oResourceBundle.getText("xfld.groupPriceBetween", [" 0-100"]);
				} else if (iPrice <= 500) {
					sKey = "BT100-500";
					sText = this._oResourceBundle.getText("xfld.groupPriceBetween", [" 100-500"]);
				} else if (iPrice <= 1000) {
					sKey = "BT500-1000";
					sText = this._oResourceBundle.getText("xfld.groupPriceBetween", [" 500-1000"]);
				} else if (iPrice > 1000) {
					sKey = "GT1000";
					sText = this._oResourceBundle.getText("xfld.groupPrice", [" 1000"]);
				} else {
					// Do not forget the fallback - note that in this example, the fallback can never be reached.
					sKey = "unknownPrice";
					sText = "?";
				}
				return {
					key: sKey,
					text: sText
				};
			},
			// Grouping function for grouping by availability
			stockQuantity: function(oListItemContext) {
				var sKey, sText, sLabel, iStockQuantity = Number(oListItemContext.getProperty("StockQuantity"));
				if (iStockQuantity <= 0) {
					sKey = "LE0";
					sText = this._oResourceBundle.getText("xfld.outOfStock");
				} else if (iStockQuantity <= 9) {
					sKey = "BT1-9";
					sText = this._oResourceBundle.getText("xfld.inStockRestricted");
				} else if (iStockQuantity > 9) {
					sKey = "GE10";
					sText = this._oResourceBundle.getText("xfld.inStock");
				} else {
					// Do not forget the fallback - note that in this example, the fallback can never be reached.
					sKey = "unknownStockQuantity";
					sText = "?";
				}
				sLabel = oListItemContext.getModel().getProperty("/#Product/StockQuantity/@sap:label");
				return {
					key: sKey,
					text: this._oResourceBundle.getText("xfld.groupingLabel", [sLabel, sText])
				};
			},
			// Grouping function for grouping by main category
			mainCategoryName: function(oListItemContext) {
				return this._getNameGrouper("MainCategoryName", oListItemContext);
			},
			// Grouping function for grouping by subcategory
			subCategoryName: function(oListItemContext) {
				return this._getNameGrouper("SubCategoryName", oListItemContext);
			},
			// Grouping function for grouping by supplier name
			supplierName: function(oListItemContext) {
				return this._getNameGrouper("SupplierName", oListItemContext);
			}
		}
	});
});