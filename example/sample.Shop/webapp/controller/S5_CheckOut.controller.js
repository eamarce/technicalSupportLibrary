sap.ui.define([
	"nw/epm/refapps/shop/controller/BaseController",
	"nw/epm/refapps/shop/reuse/util/messages",
	"sap/m/MessageToast",
	"nw/epm/refapps/shop/reuse/util/formatter",
	"sap/ui/model/json/JSONModel"
], function(BaseController, messages, MessageToast, formatterReuse, JSONModel) {

	return BaseController.extend("nw.epm.refapps.shop.controller.S5_CheckOut", {

		formatterReuse: formatterReuse,

		onInit: function() {
			this._oResourceBundle = this.getResourceBundle();
			this._oPageHeader = this.byId("checkOutObjectPageHeader");
			this._oCheckOutTable = this.byId("checkOutTable");
			// Get Context Path for S5 Screen
			this.getRouter().getRoute("CheckOut").attachPatternMatched(this._onRouteCheckOutMatched, this);
			this.oViewModel = new JSONModel({
				busy: true
			});
			this.setModel(this.oViewModel, "checkOutView");
		},

		// The route matched event is fired, because the route has a matching the pattern
		_onRouteCheckOutMatched: function() {
			this.oViewModel.setProperty("/busy", false);
		},

		// Navigate to the shopping cart screen
		onShoppingCartPressed: function() {
			this.getRouter().navTo("ShoppingCart", {}, false);
		},

		// Call a function import to submit the order
		onBuyNowPressed: function(oEvent) {
			this.oViewModel.setProperty("/busy", true);
			oEvent.getSource().getModel().callFunction("/BuyShoppingCart", {
				method: "POST",
				success: this.onCartSrvSuccess.bind(this),
				error: this.onCartSrvError.bind(this)
			});
		},

		// Refresh the header and table bindings
		_refreshBinding: function() {
			this._oPageHeader.getElementBinding().refresh(true);
			this._oCheckOutTable.getBinding("items").refresh();
		},

		// Service Error handling
		onCartSrvError: function(oResponse) {
			this.oViewModel.setProperty("/busy", false);
			messages.showErrorMessage(oResponse, this.getResourceBundle().getText("xtit.errorTitle"));
		},

		// Go back to S2 and display a message toast that the shopping cart was ordered successfully
		onCartSrvSuccess: function() {
			this.oViewModel.setProperty("/busy", false);
			MessageToast.show(this.getResourceBundle().getText("ymsg.checkOut"), {
				closeOnBrowserNavigation: false
			});
			this._refreshBinding();
			this.getRouter().navTo("ProductList", {}, false);
		}
	});
});