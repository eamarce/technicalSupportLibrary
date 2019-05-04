sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"nw/epm/refapps/shop/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("nw.epm.refapps.shop.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the device model is set, the oData model is configured, and the router is initialized.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			
			jQuery.sap.registerModulePath("com.support.technicalsupportlibrary", "../libraries/com/support/technicalsupportlibrary");

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// set select parameter model
			this.setModel(models.parameterModel(), "selectParameters");

			var oModel = this.getModel();
			oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			oModel.setDeferredGroups(["shoppingCartItem", "reviews"]);
			oModel.setChangeGroups({
				"ShoppingCartItem": {
					groupId: "shoppingCartItem"
				},
				"Review": {
					groupId: "reviews"
				}
			});

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
		getContentDensityClass: function() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});