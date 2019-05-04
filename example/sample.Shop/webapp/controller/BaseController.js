/*global history */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/generic/app/navigation/service/NavigationHandler"
], function(Controller, History, NavigationHandler) {
	"use strict";

	return Controller.extend("nw.epm.refapps.shop.controller.BaseController", {
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share button has been clicked
		 * @param {sap.ui.base.Event} oEvent the butten press event
		 * @public
		 */
		onSharePressed: function(oEvent) {
			var oShareSheet = this.getView().byId("shareSheet");
			this.attachControl(oShareSheet);
			oShareSheet.openBy(oEvent.getSource());
		},

		/**
		 * Utility method to attach a control, typically a dialog,
		 * to the view, and syncing the styleclass of the application
		 * @param {sap.ui.core.Control} oControl the control to be attached
		 * @public
		 */
		attachControl: function(oControl) {
			var sCompactCozyClass = this.getOwnerComponent().getContentDensityClass();
			jQuery.sap.syncStyleClass(sCompactCozyClass, this.getView(), oControl);
			this.getView().addDependent(oControl);
		},

		/**
		 * Convenience method for getting the navigation handler.
		 * @public
		 * @returns {sap.ui.generic.app.navigation.service.NavigationHandler} the NavigationHandler of the component
		 */
		getNavigationHandler: function() {
			return new NavigationHandler(this);
		}
	});
});