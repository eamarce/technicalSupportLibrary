sap.ui.define([
	"nw/epm/refapps/shop/controller/BaseController",
	"sap/ui/model/Sorter",
	"nw/epm/refapps/shop/reuse/util/messages",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"nw/epm/refapps/shop/model/formatter",
	"nw/epm/refapps/shop/reuse/util/formatter",
	"sap/ui/Device",
	"sap/m/TabContainer",
	"sap/ui/core/Fragment",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/Float"
	/* eslint-disable */ // using more then 8 parameters for a function is justified here	
], function(BaseController, Sorter, messages, MessageToast, JSONModel, formatter, formatterReuse, Device, TabContainer,
	Fragment) {
	/* eslint-enable */ // using more then 8 parameters for a function is justified here

	"use strict";
	return BaseController.extend("nw.epm.refapps.shop.controller.S3_MultiProductDetails", {

		formatter: formatter,
		formatterReuse: formatterReuse,

		onInit: function() {
			this._oView = this.getView();
			this._oTabContainer = this.byId("tabContainer");
			this._oProductHeaderButton = this.byId("productHeaderButton");
			this._oResourceBundle = this.getResourceBundle();
			this._oRouter = this.getOwnerComponent().getRouter();
			this._bIsEditReview = false;
			this._bIsReviewDialogOpen = false;
			this._bIsReviewRatingFragmentOpened = false;
			this._oSortDialog = null;
			this._oReviewDialog = null;
			this._oLargeImage = null;
			this._oPopover = null;
			this._sProductPath = "";
			this._sProductId = "";
			this._bSetFocus = false;
			this._oSelectedItem = null;
			this._oTabContainerTemplate = null;

			// Store original busy indicator delay, so it can be restored later on
			var iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			var oViewModel = new JSONModel({
				delay: 0,
				saveAsTileTitle: ""
			});
			this.setModel(oViewModel, "detailView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function() {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});

			// Adjust StyleClass if device is a phone
			if (Device.system.phone) {
				this.byId("productMessageStrip").addStyleClass("sapUiTinyMarginTop");
			}

			// Get Context Path for S3 Screen
			this.getRouter().getRoute("MultiProducts").attachPatternMatched(this._onRouteMultiProductsMatched, this);
			
			// Make sure tab items are unbound after they have been removed from the display!
			this.getRouter().getRoute("ProductList").attachPatternMatched(this._onRouteProductListMatched, this);			
		},
		
		_onRouteProductListMatched: function() {
			this._oTabContainer.unbindItems();	
		},

		_onRouteMultiProductsMatched: function() {
			var aFilter = this.getModel("filterModel").getData(),
				oViewModel = this.getModel("detailView"),
				oTabContainerTemplate;

			if (this._oTabContainerTemplate === null) {
				oTabContainerTemplate = this._oTabContainer.getAggregation("items")[0].clone();
				this._oTabContainerTemplate = oTabContainerTemplate;
			} else {
				oTabContainerTemplate = this._oTabContainerTemplate.clone();
			}

			this._oTabContainer.bindItems({
				path: "/Products",
				filters: aFilter,
				template: oTabContainerTemplate,
				groupId: "reviews",
				parameters: {
					select: this.getModel("selectParameters").getProperty("/selectParameterProductDetails"),
					expand: "Reviews"
				},
				events: {
					dataRequested: function() {
						this.getOwnerComponent().getModel().metadataLoaded().then(function() {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					}.bind(this),
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
						this._onTabContainerDataReceived();
					}.bind(this)
				}
			});

			this._bIsEditReview = false;
			this._bIsReviewRatingFragmentOpened = false;
			oViewModel.setProperty("/actionSheetVisible", true);
		},

		onTabContainerItemSelect: function() {
			//Reset PruductId
			this._sProductId = "";
		},

		onTabContainerItemClose: function() {
			var aItems = this._oTabContainer.getItems();
			if (aItems.length < 2) {
				// When leaving the multi product details, clear the item binding
				this._oRouter.navTo("ProductList", {});
			}
		},

		onReviewTableChange: function() {
			if (this._bSetFocus) {
				// this._getReviewTable().focus();
				this._bSetFocus = false;
			}
		},

		// --- Actions in Header Bar
		onShoppingCartPressed: function() {
			this._oRouter.navTo("ShoppingCart", {}, false);
		},

		// --- Actions in Object Header
		// Enlarge the image in a separate dialog box
		onImagePressed: function(oEvent) {
			if (!this._oLargeImage) {
				// associate controller with the fragment
				this._oLargeImage = this._instantiateFragment("nw.epm.refapps.shop.view.fragment.ProductImage");
				this._sProductId = "";
			}
			if (this._sProductId !== oEvent.getSource().getBindingContext().getProperty("Id")) {
				this._sProductPath = oEvent.getSource().getBindingContext().getPath();
				this._oLargeImage.bindElement({
					path: this._sProductPath
				});
			}
			this._oLargeImage.open();
		},

		// Close the dialog box for the enlarged image
		onImageOKPressed: function() {
			this._oLargeImage.close();
		},

		onActionSheetPressed: function(oEvent) {
			if (!this._oActionSheet) {
				this._oActionSheet = this._instantiateFragment("nw.epm.refapps.shop.view.fragment.ShareSheet");
			}
			this._oActionSheet.openBy(oEvent.getSource());
		},

		// --- Actions in Form
		// Connect Supplier Card Quick View
		onSupplierPressed: function(oEvent) {
			var oLink = oEvent.getSource();
			if (!this._oSupplierCard) {
				this._oSupplierCard = sap.ui.xmlfragment(this.getView().getId(), "nw.epm.refapps.shop.view.fragment.SupplierCard");
				this.getView().addDependent(this._oSupplierCard);
				this._sProductId = "";
			}
			if (this._sProductId !== oEvent.getSource().getBindingContext().getProperty("Id")) {
				this._sProductId = oEvent.getSource().getBindingContext().getProperty("Id");
				this._sProductPath = this.getModel().createKey("/Products", {
					Id: this._sProductId
				});
				this._oSupplierCard.bindElement({
					path: this._sProductPath + "/Supplier"
				});
			}
			this.attachControl(this._oSupplierCard);
			// delay because addDependent will do a async rerendering and will immediately close without it.
			jQuery.sap.delayedCall(0, this, function() {
				this._oSupplierCard.openBy(oLink);
			});
		},

		// create Review Rating dialog box
		onRatingPressed: function(oEvent) {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment(this.getView().getId(), "nw.epm.refapps.shop.view.fragment.ReviewRating", this);
				this._oPopover.addStyleClass("sapUiPopupWithPadding");
				this._oView.addDependent(this._oPopover);
				this.attachControl(this._oPopover);
				this._sProductId = "";
			}
			if (Device.support.touch) {
				// Open the dialog box depending on the space above or below the rating control
				var oPosition = this.getView().byId("ratingCount").$().offset();
				this._oPopover.setPlacement($(window).innerHeight() - oPosition.top < oPosition.top ? "Top" : "Bottom");
			}
			if (this._sProductId !== oEvent.getSource().getBindingContext().getProperty("Id")) {
				this._sProductPath = oEvent.getSource().getBindingContext().getPath();
				this._oPopover.bindElement({
					path: this._sProductPath
				});
			}
			this._oPopover.openBy(oEvent.getSource());
		},

		// --- Actions on Table entries
		// View Settings Dialog / Sort Rating
		onTableSettingsPressed: function() {
			if (!this._oSortDialog) {
				this._oSortDialog = this._instantiateFragment("nw.epm.refapps.shop.view.fragment.SettingsDialog");
			}
			this._oSortDialog.open();
		},

		onSortConfirmed: function(oEvent) {
			// apply sorter to binding
			var aSorters = [];
			var mParams = oEvent.getParameters();
			aSorters.push(new Sorter(mParams.sortItem.getKey(), mParams.sortDescending));
			this._getReviewTable().getBinding("items").sort(aSorters);
		},

		// --- Actions on buttons in footer bar
		// When an item is added to the ShoppingCart, this method triggers the service call to the back end.
		// Using a function import, the back end then creates a ShoppingCart if none exists yet, or
		// adds a new ShoppingCartItem to an existing cart, or updates an existing item if the added
		// product is already in the ShoppingCart
		onAddToCartPressed: function(oEvent) {
			oEvent.getSource().getModel().callFunction("/AddProductToShoppingCart", {
				method: "POST",
				urlParameters: {
					ProductId: oEvent.getSource().getBindingContext().getProperty("Id")
				},
				success: this.onCartSrvSuccess.bind(this),
				error: this.onSrvError.bind(this)
			});
		},

		onToggleFavoritePressed: function() {
			// Remember selected Tab
			this._oSelectedItem = this._getSelectedItem();
			var oItemContent = this._oSelectedItem.getContent()[0],
				oBindingContext = oItemContent.getBindingContext();
			oItemContent.getHeaderTitle().setMarkFavorite(!(oBindingContext.getProperty("IsFavoriteOfCurrentUser")));
		},

		_onTabContainerDataReceived: function() {
			if (this._oSelectedItem) {
				this._oTabContainer.setSelectedItem(this._oSelectedItem);
			} else {
				this._oTabContainer.setSelectedItem(this._getSelectedItem());
			}
			this._oSelectedItem = null;
		},

		_initializeReviewDialog: function() {
			this._oReviewDialog = sap.ui.xmlfragment(this.getView().getId(), "nw.epm.refapps.shop.view.fragment.ReviewDialog", this);
			// Set the focus on the text area
			this._oReviewDialog.setInitialFocus("textArea");
			this.attachControl(this._oReviewDialog);
		},

		// Button to open the review dialog. If the logged-on user does not have his or her own review, the dialog is opened
		// with initial values, otherwise the URL of the user's own review is determined in the list of reviews and bound to
		// the elements of the dialog to open the dialog with the values of the review. In addition, the visibility of the
		// recycle bin is triggered depending on whether or not the logged-on user has his or her own review.
		onEditReviewPressed: function(oEvent) {
			if (!this._oReviewDialog) {
				this._initializeReviewDialog();
			}
			this._oReviewDialog.unbindObject();

			var oModel = oEvent.getSource().getModel();
			oModel.setRefreshAfterChange(false);

			this.byId("okButton").setEnabled(false);

			this._bIsReviewDialogOpen = true;
			var bHasOwnReview = false,
				oBTNDelete = this.byId("reviewDeleteButton"),
				oReviewTable = this._getReviewTable();
			oBTNDelete.setVisible(bHasOwnReview);

			// Determine the review URL and bind values to the elements
			var i = 0;
			for (i = 0; i < oReviewTable.getItems().length; i++) {
				if (oReviewTable.getItems()[i].getBindingContext().getProperty("IsReviewOfCurrentUser")) {
					this._bIsEditReview = true;
					this._oReviewDialog.setBindingContext(oReviewTable.getItems()[i].getBindingContext());
					bHasOwnReview = true;
					oBTNDelete.setVisible(bHasOwnReview);
					break;
				}
			}
			// Open dialog empty if the logged-on user does not have his or her own review
			if (!bHasOwnReview) {
				var oNewReview = oModel.createEntry("/Reviews", {
						groupId: "reviews"
					}),
					oItemContent = this._getSelectedItem().getContent()[0],
					oBindingContext = oItemContent.getBindingContext(),
					sProductId = this.getView().getModel().getProperty(oBindingContext.getPath()).Id;
				oModel.setProperty("ProductId", sProductId, oNewReview);
				this._oReviewDialog.setBindingContext(oNewReview);
			}
			this._oReviewDialog.open();
		},

		// --- Actions on links for a review item
		// Link "Rate as Helpful" is pressed
		onRateAsHelpfulPressed: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().getPath() + "/HelpfulForCurrentUser",
				oModel = this.getModel();
			var bRatedAsHelpful = oModel.getProperty(sPath);
			if (bRatedAsHelpful) {
				oModel.setProperty(sPath, false);
			} else {
				oModel.setProperty(sPath, true);
			}
			oModel.submitChanges({
				error: (this.onSrvError.bind(this))
			});
			this._bSetFocus = true;
		},

		// Open Review dialog box if "Edit" link is pressed and fill with Review data
		onEditReviewLinkPressed: function(oEvent) {
			if (!this._oReviewDialog) {
				this._initializeReviewDialog();
			}
			this.byId("okButton").setEnabled(false); // disable OK button on review dialog
			this.byId("reviewDeleteButton").setVisible(true); // show delete button on review dialog
			this._oReviewDialog.bindElement(oEvent.getSource().getBindingContext().getPath());
			this._bIsEditReview = true;
			this._bIsReviewDialogOpen = true;
			this._oReviewDialog.open();
		},

		// Delete Review if "Delete" link is pressed
		onDeleteReviewLinkPressed: function(oEvent) {
			oEvent.getSource().getModel().remove(oEvent.getSource().getBindingContext().getPath(), {
				success: this.onReviewDeleteSrvSuccess.bind(this),
				error: this.onSrvError.bind(this)
			});
			this._bIsEditReview = false;
		},

		// --- Actions on buttons on the review dialog
		onReviewDialogOKPressed: function(oEvent) {
			oEvent.getSource().getModel().setRefreshAfterChange(true);
			this._oReviewDialog.close();

			oEvent.getSource().getModel().submitChanges({
				success: this.onReviewSrvSuccess.bind(this),
				error: this.onSrvError.bind(this),
				groupId: "reviews"
			});
		},

		// Close the Review Dialog
		onReviewDialogCancelPressed: function() {
			this.getModel().resetChanges();
			this.getModel().setRefreshAfterChange(true);
			this._oReviewDialog.unbindObject();
			this._oReviewDialog.close();
		},

		onReviewDialogDeletePressed: function(oEvent) {
			var sDeleteReviewPath = oEvent.getSource().getBindingContext().getPath();
			if (this._bIsReviewDialogOpen) {
				this._oReviewDialog.close();
				this._bIsReviewDialogOpen = false;
			}
			this._oReviewDialog.unbindContext();
			oEvent.getSource().getModel().remove(sDeleteReviewPath, {
				success: this.onReviewDeleteSrvSuccess.bind(this),
				error: this.onSrvError.bind(this)
			});
			this._bIsEditReview = false;
		},

		// Enable OK button if Rating and Comment is filled
		onTextAreaChanged: function() {
			this.byId("okButton").setEnabled(false);
			var iRatingCount = this.byId("ratingIndicator").getValue();
			var sReviewComment = this.byId("textArea").getValue();
			if (iRatingCount > 0 && sReviewComment) {
				this.byId("okButton").setEnabled(true);
			}
		},

		// Enable OK button if Rating and Comment is filled
		onRatingChanged: function() {
			this.byId("okButton").setEnabled(false);
			var iRatingCount = this.byId("ratingIndicator").getValue();
			var sReviewComment = this.byId("textArea").getValue();
			if (iRatingCount > 0 && sReviewComment) {
				this.byId("okButton").setEnabled(true);
			}
		},

		// --- oData Service callback functions
		onCartSrvSuccess: function(oEvent) {
			var sKey = this.getOwnerComponent().getModel().createKey("/Products", {
				Id: oEvent.ProductId
			});
			var sProductName = this.getOwnerComponent().getModel().getProperty(sKey).Name;
			MessageToast.show(this._oResourceBundle.getText("ymsg.addProduct", [sProductName]));
			this._oProductHeaderButton.bindElement({
				path: "/ShoppingCarts(-1)",
				parameters: {
					select: "TotalQuantity"
				}
			});
			this._oProductHeaderButton.getElementBinding().refresh();
		},

		// Callback if creation or editing of a review was successful
		onReviewSrvSuccess: function() {
			// Remember selected Tab
			this._oSelectedItem = this._getSelectedItem();
			// Initialize the review dialog
			this._oReviewDialog.unbindObject();
			this._oTabContainer.getBinding("items").refresh();
			this._bSetFocus = true;
		},

		// Callback if deletion of a review was successful
		onReviewDeleteSrvSuccess: function() {
			// Remember selected Tab
			this._oSelectedItem = this._getSelectedItem();
			if (this._oReviewDialog) {
				// Remove the BindingContext, otherwise the Binding will be refreshed with an invalid path
				this._oReviewDialog.unbindObject();
			}
			this._oTabContainer.getBinding("items").refresh();
			this._bSetFocus = true;
		},

		// Callback in the event of errors
		onSrvError: function(oResponse) {
			messages.showErrorMessage(oResponse, this._oResourceBundle.getText("xtit.errorTitle"));
		},

		onNavBack: function() {
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			this._oTabContainer.destroyContent();

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#"
					}
				});
			}
		},

		// This method instantiate fragment by name
		_instantiateFragment: function(sFragmentName) {
			var oFragment = sap.ui.xmlfragment(this.getView().getId(), sFragmentName, this);
			// switch the dialog to compact mode if the hosting view has compact mode
			this.attachControl(oFragment);
			return oFragment;
		},

		_getSelectedItem: function() {
			var oItem = this.byId(this._oTabContainer.getSelectedItem());
			return oItem;
		},

		_getReviewTable: function() {
			var oSelectedItemContent = this.byId(this._oTabContainer.getSelectedItem()).getContent()[0],
				oReviewSection = oSelectedItemContent.getSections()[1],
				oReviewSubSection = oReviewSection.getSubSections()[0],
				oReviewTable = oReviewSubSection.getBlocks()[0];

			return oReviewTable;
		}
	});
});