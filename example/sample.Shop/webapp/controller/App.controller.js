sap.ui.define([
	"nw/epm/refapps/shop/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("nw.epm.refapps.shop.controller.App", {

		onInit: function() {
			var oViewModel,
				oFilterModel,
				fnSetAppNotBusy,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function() {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			//It is necessary to use metadataLoaded Promise for success,
			//but this promise is never rejected, therefore the attachMetadataFailed
			//is needed for the failed case.
			this.getOwnerComponent().getModel().metadataLoaded().
			then(fnSetAppNotBusy);
			this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			oFilterModel = new JSONModel({});
			this.setModel(oFilterModel, "filterModel");
		}
	});

});