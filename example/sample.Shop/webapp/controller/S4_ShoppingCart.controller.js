sap.ui.define([
	"nw/epm/refapps/shop/controller/BaseController",
	"nw/epm/refapps/shop/reuse/util/messages",
	"nw/epm/refapps/shop/reuse/util/formatter",
	"nw/epm/refapps/shop/model/formatter",
	"sap/ui/model/json/JSONModel"
], function(BaseController, messages, formatterReuse, formatter, JSONModel) {
	"use strict";

	return BaseController.extend("nw.epm.refapps.shop.controller.S4_ShoppingCart", {

		formatterReuse: formatterReuse,
		formatter: formatter,

		onInit: function() {
			this._oDataModel = this.getOwnerComponent().getModel();
			this._oPageHeader = this.byId("shoppingCartObjectPageHeader");
			this._oShoppingCartTable = this.byId("shoppingCartTable");
			this._oResourceBundle = this.getResourceBundle();
			this._oRouter = this.getOwnerComponent().getRouter();
			this._bRefreshAfterChange = false;
			this.oViewModel = new JSONModel({
				busy: true
			});
			this.setModel(this.oViewModel, "shoppingCartView");
			// Get Context Path for S4 Screen
			this.getRouter().getRoute("ShoppingCart").attachPatternMatched(this._onRouteShoppingCartMatched, this);
		},

		_onRouteShoppingCartMatched: function() {
			if (this.oViewModel.getProperty("/busy")) {
				this.oViewModel.setProperty("/busy", false);
			} else {
				// Refresh ShoppingCart table 
				this._oShoppingCartTable.getBinding("items").refresh();
			}
		},

		// Disable the checkout button if there is invalid user input or the ShoppingCart is empty
		onUpdateFinished: function() {
			var iItemCount = this._oShoppingCartTable.getItems().length,
				bEnabled = !this._hasInvalidQuantityValues() && iItemCount > 0;
			// Refresh header
			this._oPageHeader.getElementBinding().refresh(true);
			this.byId("checkOutButton").setEnabled(bEnabled);
		},

		// Navigate back to the previous screen
		onContinueShoppingPressed: function() {
			if (!this._hasInvalidQuantityValues()) {
				this._oRouter.navTo("ProductList", {}, false);
			}
		},

		// Navigate to the product details of the selected ShoppingCartItem
		// If the screen contains invalid user input, the navigation is suppressed
		onLineItemPressed: function(oEvent) {
			if (this._hasInvalidQuantityValues()) {
				return;
			}
			this._oRouter.navTo("ProductDetails", {
				productId: encodeURIComponent(oEvent.getSource().getBindingContext().getProperty("ProductId"))
			}, false);
		},

		// Navigate to the checkout screen
		onCheckoutButtonPressed: function() {
			this._oRouter.navTo("CheckOut", {}, false);
		},

		// Change quantity for the selected ShoppingCartItem
		onQuantityChanged: function(oEvent) {
			var oInputField = oEvent.getSource(),
				oData = {};
			oData.Quantity = parseFloat(oEvent.getParameter("newValue"), 10);

			// Display an error message if the quantity is not a positive whole number
			if (isNaN(oData.Quantity) || oData.Quantity % 1 !== 0 || oData.Quantity < 0) {
				oInputField.setValueState("Error");
				this.byId("checkOutButton").setEnabled(false);
				this._bRefreshAfterChange = true;
				return;
			}

			// Delete the ShoppingCartItem if the quantity is 0
			if (oData.Quantity === 0) {
				// Reset the quantity change, because this change will never be submitted otherwise the newly added item has in some cases quantity 0
				this._oDataModel.resetChanges();
				this._deleteShoppingCartItem(oInputField.getParent());
				return;
			}
			if (this._bRefreshAfterChange) {
				this._oDataModel.setRefreshAfterChange(true);
				this._bRefreshAfterChange = false;
			}

			// Handler for successful update
			var fnOnQuantityUpdated = function() {
				oInputField.setValueState(); // reset error value state
			};

			this._oDataModel.submitChanges({
				success: fnOnQuantityUpdated.bind(this),
				error: this.onErrorOccurred.bind(this),
				groupId: "shoppingCartItem"
			});
		},

		// Delete selected Shopping Cart Item
		onDeletePressed: function(oEvent) {
			this._deleteShoppingCartItem(oEvent.getParameter("listItem"));
		},

		_deleteShoppingCartItem: function(oShoppingCartItem) {
			// Handler for successful deletion
			var fnOnItemDeleted = function() {};

			this._oDataModel.remove(oShoppingCartItem.getBindingContext().getPath(), {
				success: fnOnItemDeleted.bind(this),
				error: this.onErrorOccurred.bind(this)
			});
		},

		onErrorOccurred: function(oResponse) {
			messages.showErrorMessage(oResponse, this._oResourceBundle.getText("xtit.errorTitle"));
		},

		_hasInvalidQuantityValues: function() {
			var iQuantityColumnIndex = this._oShoppingCartTable.indexOfColumn(this.byId("quantityColumn"));
			if (iQuantityColumnIndex === -1) {
				return false;
			}
			var i, aItems = this._oShoppingCartTable.getItems();
			for (i = 0; i < aItems.length; i++) {
				if (aItems[i].getCells()[iQuantityColumnIndex].getValueState() === "Error") {
					return true;
				}
			}
			return false;
		}
	});
});