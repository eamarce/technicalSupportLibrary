sap.ui.define([
		"sap/ui/test/Opa5",
		"nw/epm/refapps/shop/test/integration/pages/Common",
		"sap/ui/test/matchers/AggregationLengthEquals",
		"sap/ui/test/matchers/AggregationFilled",
		"sap/ui/test/matchers/PropertyStrictEquals"
	],
	function(Opa5, Common) {
		"use strict";
		var pdtRating;
		// total quantity before a change
		var oTQBefore;

		return Opa5.createPageObjects({
			/* eslint-disable */
			onPageS2_ProductList: {
				/* eslint-enable */
				baseClass: Common,

				actions: {

					iDisplayReviewForFirstProduct: function() {

						return this.waitFor({
							id: "catalogTable",
							viewName: "S2_ProductList",
							matchers: new sap.ui.test.matchers.AggregationFilled({
								name: "items"
							}),
							success: function(oProductList) {
								pdtRating = oProductList.getItems()[0].getCells()[4].getContent()[0].getValue();
								Opa5.assert.ok(oProductList, "Rating for the first product is " + pdtRating);
							},
							errorMessage: "Did not find the product list"
						});
					},

					iClickItemProductList: function() {
						return this.waitFor({
							id: "catalogTable",
							viewName: "S2_ProductList",
							matchers: new sap.ui.test.matchers.AggregationFilled({
								name: "items"
							}),
							success: function(oProductList) {
								this.getContext().oPL = oProductList;

								this.waitFor({
									id: "catalogTitle",
									viewName: "S2_ProductList",
									success: function() {

										var oFirstItem = this.getContext().oPL.getItems()[0];
										this.getContext().oProdSel = oFirstItem.getCells()[2].getContent()[0].getTitle();
										oFirstItem.firePress();
									},

									errorMessage: "Unable to click on product"
								});

								Opa5.assert.ok(oProductList, "Found the product list view");
							}
						});
					},
					iClickP1: function() {
						return this.waitFor({
							viewName: "S2_ProductList",
							id: "personalizationButton",
							success: function(oButton) {
								oButton.firePress();
							},
							errorMessage: "Did not find the personalization button"
						});
					},

					// mainly used for the navigation tests
					iGetShoppingCartTotal: function() {
						// get the initial total quantity of the shopping cart   
						this.waitFor({
							id: "productListHeaderButton",
							viewName: "S2_ProductList",
							check: function(oCartBtn) {
								// wait until the total quantity has a fiexed value
								if (oCartBtn.getText()) {
									return true;
								}
								return false;
							},
							success: function(oCartBtn) {
								oTQBefore = oCartBtn.getText();
							}
						});
						return this;
					},
					iChooseTheFirstProd: function() {
						var oFirstItem = this.getContext().oPL.getItems()[0];
						this.getContext().oProdSel = oFirstItem.getCells()[2].getContent()[0].getTitle();
						oFirstItem.firePress();
						return this;
					},
					// mainly used for the shopping cart function tests
					iAddFirstToCart: function() {
						// Add first product in the product list to the shopping cart
						var oAddToBtn = this.getContext().oPL.getItems()[0].getCells()[6];
						oAddToBtn.firePress();
						return this;
					},
					iAddSecondToCart: function() {
						// Add second product in the product list to the shopping cart
						var oAddToBtn = this.getContext().oPL.getItems()[1].getCells()[6];
						oAddToBtn.firePress();
						return this;
					},
					iOpenCart: function() {
						// get the cart button	
						return this.waitFor({
							id: "productListHeaderButton",
							viewName: "S2_ProductList",
							success: function(oCartBtn) {
								oCartBtn.firePress();
							}
						});
					}
				},

				assertions: {
					iSeeCancel: function() {
						return this.waitFor({
							searchOpenDialogs: true,
							controlType: "sap.m.Button",
							matchers: new sap.ui.test.matchers.PropertyStrictEquals({
								name: "text",
								value: "Cancel"
							}),
							success: function(oButton1) {
								Opa5.assert.ok(oButton1, "Personalization Dialog Opened");
							},
							errorMessage: "Did not find the Personalization Dialog"
						});
					},

					iSeeTheProductList: function() {
						return this.waitFor({
							id: "catalogTable",
							viewName: "S2_ProductList",
							matchers: new sap.ui.test.matchers.AggregationFilled({
								name: "items"
							}),
							success: function(oProductList) {
								this.getContext().oPL = oProductList;
								Opa5.assert.ok(oProductList, "Found the product list view");
							}
						});
					},
					iCheckShoppingCartBC: function() {
						// Check the shopping cart before a change  
						this.waitFor({
							id: "productListHeaderButton",
							viewName: "S2_ProductList",
							check: function(oCartBtn) {
								// wait until the total quantity get a fixed value
								if (oCartBtn.getText()) {
									return true;
								}
								return false;
							},
							success: function(oCartBtn) {
								var oTQ = oCartBtn.getText();
								Opa5.assert.ok(oTQ, "Found the total quantity of the shopping cart");
							}
						});
						return this;
					},
					iCheckShoppingCartTotal: function() {
						var oTQAfter;
						// get the total quantity of the shopping cart after addding one piece of product to the cart   
						this.waitFor({
							id: "productListHeaderButton",
							viewName: "S2_ProductList",
							check: function(oCartBtn) {
								// wait until the total quantity has been updated 
								oTQAfter = oCartBtn.getText();
								if (oTQAfter !== oTQBefore) {
									return true;
								}
								return false;
							},
							success: function() {
								var oTQBeforeNum = Number(oTQBefore);
								var oToBeAfter = String(oTQBeforeNum + 1);
								Opa5.assert.strictEqual(oTQAfter, oToBeAfter, "One product has been added to the shopping cart");
							}
						});
						return this;
					},
					iCheckBuyNow: function() {
						var oTQAfter;
						// the product list view should be shown again and 
						// the total quantity of the shopping cart should be set as 0 after the buy now  
						this.waitFor({
							id: "productListHeaderButton",
							viewName: "S2_ProductList",
							check: function(oCartBtn) {
								// wait until the total quantity has been updated 
								oTQAfter = oCartBtn.getText();
								if (oTQAfter === "0") {
									return true;
								}
								return false;
							},
							success: function() {
								Opa5.assert.strictEqual(oTQAfter, "0", "The shopping cart has been resetted");
							}
						});
						return this;
					}
				}
			}
		});
	});