sap.ui.define([
	"sap/ui/test/Opa5",
	"nw/epm/refapps/shop/test/integration/pages/Common",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function(Opa5, Common) {

	"use strict";
	var rowCount = 0;
	var oReviewMode;
	var oOverflowButton;

	// favorite mark before a change
	var oFMBefore;

	return Opa5.createPageObjects({
		/* eslint-disable */
		onPageS3_ProductDetails: {
			/* eslint-enable */
			baseClass: Common,

			actions: {

				iClickWriteReview: function() {
					// open the review dialog	    
					this.waitFor({
						actions: function() {
							if (typeof oOverflowButton !== "undefined") {
								oOverflowButton.firePress();
							}
						},
						success: function() {
							this._executeClickWriteReview();
						}
					});
				},

				_executeClickWriteReview: function() {

					var oReviewButton;
					this.waitFor({
						controlType: Opa5.getWindow().sap.m.Button,
						viewName: "S3_ProductDetails",
						check: function(aButtons) {
							return aButtons.filter(function(oButton) {
								if (oButton.getText() === "Write a Review" || oButton.getText() === "My Review") {
									oReviewButton = oButton;
									return true;
								}
								return false;
							});
						},
						actions: function() {

							if (oReviewButton.getText() === "Write a Review") {
								oReviewMode = "w";
							} else {
								oReviewMode = "e";
							}
							// Get review dialog window 			   
							oReviewButton.firePress();
						}
					});
					return this;
				},

				iClickEditReview: function() {
					// edit a review 	 
					return this.waitFor({
						controlType: "sap.m.Link",
						viewName: "S3_ProductDetails",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: "Edit"
						}),
						success: function(oLinks) {
							oReviewMode = "e";
							//Click the first edit link   
							oLinks[0].firePress();
						}
					});
				},

				iClickRateAsHelpful: function() {
					// edit my review 	    
					return this.waitFor({
						controlType: "sap.m.Link",
						viewName: "S3_ProductDetails",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: "Rate as Helpful"
						}),
						success: function(oLinks) {
							oLinks[0].firePress();
						}
					});
				},

				iSeeRatingTable: function() {
					return this.waitFor({
						id: "reviewTable",
						viewName: "S3_ProductDetails",
						pollingInterval: 2000,
						matchers: new sap.ui.test.matchers.AggregationFilled({
							name: "items"
						}),
						success: function(oRTable) {

							var oItems = oRTable.getItems();
							rowCount = oItems.length;
							Opa5.assert.ok(oRTable, "Number of reviews: " + rowCount);
						},
						errorMessage: "The review Table is not present"
					});
				},

				iClickDeleteIcon: function() {
					// delete icon
					return this.waitFor({
						viewName: "S3_ProductDetails",
						id: "reviewDeleteButton",
						actions: function(oDeleteIcon) {
							oDeleteIcon.firePress();
						},
						errorMessage: "no delete Icon"
					});
				},

				iWriteReview: function() {
					// object IDs in the dialog window are global IDs without prefix, so that no viewname is needed for reaching the objects
					// Since the re-work to DynamicPage and removing SemanticPage the viewname is necessary!
					this.waitFor({
						viewName: "S3_ProductDetails",
						id: ["ratingIndicator", "textArea", "okButton"],
						success: function(aControls) {
							// Rating indicator
							var oRIndicator = aControls[0];
							// Text area
							var oTextArea = aControls[1];
							// OK button
							var oOkBtn = aControls[2];

							if (oReviewMode === "w") {
								// set RatingIdicator
								oRIndicator.setValue(5);
								// set TextArea
								oTextArea.setValue("Opa Test");
							} else {
								// set RatingIdicator
								oRIndicator.setValue(1);
								// set TextArea
								oTextArea.setValue("Opa Test Edit Review");
							}
							// click ok to close the dialog   
							oOkBtn.firePress();
						}
					});
					return this;
				},

				iClickRatings: function() {
					return this.waitFor({
						id: "ratingCount",
						controlType: "sap.m.Link",
						viewName: "S3_ProductDetails",

						actions: function(oRating) {
							oRating.firePress();
						}
					});
				},

				iClickCompanyCard: function() {
					return this.waitFor({
						controlType: "sap.m.Link",
						viewName: "S3_ProductDetails",

						success: function(oLinks) {
							oLinks[0].firePress();
						}
					});
				},

				iClickFavorite: function() {
					this.waitFor({
						controlType: Opa5.getWindow().sap.m.Button,
						viewName: "S3_ProductDetails",
						check: function(aButtons) {
							return aButtons.filter(function(oButton) {

								if (oButton.getId() === "application-EPMProduct-shop-component---S3_ProductDetailsView--productDetailsHeader-overflow") {
									oOverflowButton = oButton;
									return true;
								} else if (oButton.getId() === "application-EPMProduct-shop-component---S3_ProductDetailsView--productDetailsFavoriteButton") {
									return true;
								}
								return false;
							});
						},
						actions: function() {
							if (typeof oOverflowButton !== "undefined") {
								oOverflowButton.firePress();
							}
						},
						success: function() {
							if (typeof oOverflowButton === "undefined") {
								this._executeClickFavorite(false);
							} else {
								this._executeClickFavorite(true);
							}
						}
					});
				},

				_executeClickFavorite: function(withTextSearch) {
					if (withTextSearch === false) {
						return this.waitFor({
							id: "productDetailsFavoriteButton",
							viewName: "S3_ProductDetails",

							actions: function(oButtons) {
								// set the favorite 	
								oButtons.firePress();
							}
						});
					} else {
						var oFavoriteButton;
						return this.waitFor({
							controlType: Opa5.getWindow().sap.m.Button,
							viewName: "S3_ProductDetails",
							check: function(aButtons) {
								return aButtons.filter(function(oButton) {
									if (oButton.getText() === "Add to Favorites") {
										oFavoriteButton = oButton;
										return true;
									}
									return false;
								});
							},
							actions: function() {
								oFavoriteButton.firePress();
							}
						});
					}
				},

				iClickDeleteReview: function() {
					// remove my review 	    
					return this.waitFor({
						controlType: "sap.m.Link",
						viewName: "S3_ProductDetails",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: "Delete"
						}),
						success: function(oLinks) {
							// click the first link with delete as text		   
							oLinks[0].firePress();
						}
					});
				},

				iClickShoppingCart: function() {
					return this.waitFor({
						viewName: "S3_ProductDetails",
						id: "productHeaderButton",
						actions: function(oButtonsCart) {
							//click the cart button
							oButtonsCart.firePress();
						},
						errorMessage: "Did not find the cart button"

					});
				},
				iAddToCart: function() {
					return this.waitFor({
						id: "productDetailsAddToCartButton",
						viewName: "S3_ProductDetails",
						actions: function(oButtons) {
							// add the product to the shopping cart 	 
							oButtons.firePress();
						}
					});
				},

				// mainly used for the navigation tests
				iAddToCartOld: function() {
					var oBtnCart = this.getContext().oS3Controller.getHeaderBtn();
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: "S3_ProductDetails",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: "Add to Cart"
						}),
						actions: function(oButtons) {
							// add the product to the shopping cart 	 
							oButtons[0].firePress();
							// open the shopping cart
							oBtnCart.firePress();
						}
					});
				},

				iBackToPL: function() {
					return this.waitFor({
						id: "backBtn",
						controlType: "sap.ushell.ui.shell.ShellHeadItem",
						actions: function(oShellBackBtnS3) {
							// nav back
							oShellBackBtnS3.firePress();
						},
						errorMessage: "Did not find the nav button on S3_ProductDetails page"
					});
				},

				// mainly used for the review tests
				iOpenReview: function() {
					// open the review dialog	    
					var oReviewButton;
					this.waitFor({
						controlType: Opa5.getWindow().sap.m.Button,
						viewName: "S3_ProductDetails",
						check: function(aButtons) {
							return aButtons.some(function(oButton) {
								if (oButton.getText() === "Write a Review" || oButton.getText() === "My Review") {
									oReviewButton = oButton;
									return true;
								}
								return false;
							});
						},
						actions: function() {
							// set the review mode depending on whether to write a new review or to edit an existing review  
							if (oReviewButton.getText() === "Write a Review") {
								oReviewMode = "w";
							} else {
								oReviewMode = "e";
							}
							// Get review dialog window 			   
							oReviewButton.firePress();
						}
					});
					return this;
				},

				iChooseEditReview: function() {
					// edit my review 	    
					return this.waitFor({
						controlType: "sap.m.Link",
						viewName: "S3_ProductDetails",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: "Edit"
						}),
						actions: function(oLinks) {
							// set the editing mode    
							oReviewMode = "e";
							// click that link to get review dialog window 			   
							oLinks[0].firePress();
						}
					});
				},

				iDeleteReview: function() {
					// remove my review 	    
					return this.waitFor({
						controlType: "sap.m.Link",
						viewName: "S3_ProductDetails",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: "Delete"
						}),
						actions: function(oLinks) {
							// click that link to remove my review			   
							oLinks[0].firePress();
						}
					});
				},

				iGetFavorite: function() {
					this.waitFor({
						id: "productDetailsHeader",
						viewName: "S3_ProductDetails",
						actions: function(oPDH) {
							oFMBefore = oPDH.getMarkFavorite();
						}
					});
					return this;
				},

				iSetFavorite: function() {
					// set a product as my favorite one	    
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: "S3_ProductDetails",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "icon",
							value: "sap-icon://favorite"
						}),
						success: function(oButtons) {
							// set the favorite 			   
							oButtons[0].firePress();
						}
					});
				}
			},

			assertions: {
				iSeeReviewDialog: function() {
					return this.waitFor({
						viewName: "S3_ProductDetails",
						id: "reviewDialog",
						success: function(oDialog) {
							Opa5.assert.ok(oDialog.isOpen(), "Review Dialog is open");
						},
						errorMessage: "The review Dialog is not open"
					});
				},

				iCheckRateAsHelpful: function() {

					return this.waitFor({
						controlType: "sap.m.Link",
						viewName: "S3_ProductDetails",
						pollingInterval: 2000,

						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: "Rate as Helpful"
						}),
						success: function(oLinks) {
							var prop = oLinks[0].getProperty("enabled");
							Opa5.assert.ok(oLinks, "Rate as Helpful Link is clicked with enabled property as:" + prop);
						},
						errorMessage: "Rate as Helpful Link is not present"
					});
				},
				iSeeProductDetails: function() {
					return this.waitFor({
						id: "productDetailsHeader",
						viewName: "S3_ProductDetails",
						success: function(oProductHeader) {
							Opa5.assert.ok(oProductHeader, "Navigated to product details view successfully");
						},
						errorMessage: "Product details header is not present"
					});
				},

				iCheckFavoriteSetOn: function() {
					this.waitFor({
						id: "productDetailsHeader",
						viewName: "S3_ProductDetails",
						success: function(oFavIcon) {
							// Favorite mark after a setting 
							Opa5.assert.ok(oFavIcon, "Favorite Icon is displayed at the product header-" + oFavIcon.getMarkFavorite());
						},
						errorMessage: "The favorite mark is not displayed"
					});
					return this;
				},

				iCheckFavoriteSetOff: function() {
					this.waitFor({

						id: "productDetailsHeader",
						viewName: "S3_ProductDetails",
						check: function(oPDH) {
							oFMBefore = true;
							// wait until the favorite mark has been updated
							var oFMAfter = oPDH.getMarkFavorite();
							Opa5.assert.ok(oPDH, "Favorite Icon-" + oPDH.getMarkFavorite());
							if (oFMAfter !== oFMBefore) {
								return true;
							}
							return false;
						},
						success: function(oPDH) {
							Opa5.assert.ok(oPDH, "Favorite Icon is not displayed at the product header");

						},
						errorMessage: "The favorite mark is not toggled"
					});
					return this;
				},
				iSeeCompanyCard: function() {
					return this.waitFor({
						viewName: "S3_ProductDetails",
						id: "companyQuickView-quickView-popover",
						success: function(oPopover) {
							ok(oPopover, "Company card pop over is open");
						},
						errorMessage: "Comapny card pop over is not open"
					});
				},

				iCheckReviewTableAfterDeletion: function() {
					this.waitFor({
						id: "reviewTable",
						viewName: "S3_ProductDetails",
						check: function(oReviewT) {
							var oItems = oReviewT.getItems();
							if (oItems.length === rowCount) {
								return true;
							}
							return false;
						},
						success: function(oReviewT) {
							Opa5.assert.ok(oReviewT, "The review is removed from the list");
						},
						errorMessage: "The review is not removed from the list"
					});
					return this;
				},

				iCheckReviewTable: function() {
					this.waitFor({
						id: "reviewTable",
						viewName: "S3_ProductDetails",
						actions: function(oReviewT) {
							// wait until the "Me" item has been created
							var oItems = oReviewT.getItems();

							if (oReviewMode === "w") {
								if ((rowCount + 1) === (oItems.length)) {
									return true;
								} else {
									return false;
								}

							} else {

								var oItemMe = oItems[0];
								// Rating WebEdit Text
								var oRatingValue = oItemMe.getCells()[0].getValue();
								if (oRatingValue === 1) {

									var oRatingText = oItemMe.getCells()[2].getText();
									if (oRatingText === "Opa Test Edit Review") {
										return true;
									}
								}
							}
							return false;
						},

						success: function() {
							Opa5.assert.ok(true, "the review is added to the review table and the review value is updated");
						},
						errorMessage: "the review is not added to the review table"
					});
					return this;
				},

				iSeeTheProductDetail: function() {
					var oProdSel = this.getContext().oProdSel;
					return this.waitFor({
						id: "productDetailsHeader",
						viewName: "S3_ProductDetails",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "objectTitle",
							value: oProdSel
						}),
						success: function(oPH) {
							this.getContext().oS3Controller = oPH.getParent().getParent().getParent().getParent().getController();
							// the product header is only available in the product detail view
							Opa5.assert.ok(oPH, "Found the product detail view");
						}
					});
				},
				iCheckFavorite: function() {
					this.waitFor({
						id: "productDetailsHeader",
						viewName: "S3_ProductDetails",
						check: function(oPDH) {
							// wait until the favorite mark has been updated
							var oFMAfter = oPDH.getMarkFavorite();
							if (oFMAfter !== oFMBefore) {
								return true;
							}
							return false;
						},
						success: function(oPDH) {
							// Favorite mark after a setting 
							var oFMAfter = oPDH.getMarkFavorite();
							Opa5.assert.strictEqual(!oFMAfter, oFMBefore, "The Favorite mark has been toggled");
						},
						errorMessage: "The favorite mark is not toggled"
					});
					return this;
				}
			}
		}
	});
});