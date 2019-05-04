sap.ui.define([
	"sap/ui/test/Opa5",
	"nw/epm/refapps/shop/test/integration/pages/Common",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function(Opa5) {
	"use strict";

	var sPdtName;
	var oProductName;

	return Opa5.createPageObjects({
		Generic: {

			actions: {

				iClickBuyNow: function() {
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: "S5_CheckOut",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: "Buy Now"
						}),

						success: function(oBuyNowButton) {
							$(oBuyNowButton).trigger("tap");

						},
						errorMessage: "Did not find Buy Now button"

					});
				},

				iClickCheckOut: function() {
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: "S4_ShoppingCart",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: "Go to Checkout"
						}),

						success: function(oBtnCheckOut) {
							$(oBtnCheckOut).trigger("tap");

						},
						errorMessage: "Did not find Go To Checkout button"

					});
				},

				iGetProductNamePL: function() {
					// get the product name of the first shopping item  

					return this.waitFor({
						id: "catalogTable",
						viewName: "S2_ProductList",
						matchers: new sap.ui.test.matchers.AggregationFilled({
							name: "items"
						}),
						success: function(oPLTable) {
							sPdtName = oPLTable.getItems()[0].getCells()[2].getContent()[0].getTitle();
							Opa5.assert.ok(true, "Product found: " + sPdtName);
						},
						errorMessage: "Did not find the product name in shopping cart table"

					});
				},

				iClickShoppingCart: function() {

					return this.waitFor({

						viewName: "S2_ProductList",
						id: "productListHeaderButton",

						success: function(oButtonsCart) {
							//click the cart button
							oButtonsCart.firePress();
						},
						errorMessage: "Did not find the cart button"

					});
				},

				iDeleteProduct: function() {
					// Delete the first shopping item
					return this.waitFor({
						id: "shoppingCartTable",
						viewName: "S4_ShoppingCart",
						matchers: new sap.ui.test.matchers.AggregationFilled({
							name: "items"
						}),
						success: function(oSCTab) {
							oSCTab.getItems()[0]._oDeleteControl.firePress();
						}
					});
				},

				iChangeQuantity: function() {
					// Change the quantity of the shopping item   
					return this.waitFor({
						id: "shoppingCartTable",
						viewName: "S4_ShoppingCart",
						matchers: new sap.ui.test.matchers.AggregationFilled({
							name: "items"
						}),
						success: function(oSCTab) {
							oSCTab.getItems()[0].getCells()[3].setValue("3");
							Opa5.assert.ok(oSCTab, "Quantitiy of products changed");
						}
					});
				},

				iGetNumberofProducts: function() {
					// get the quantity of the first shopping item before a change  
					var oQuantityBefore;
					return this.waitFor({
						id: "shoppingCartTable",
						viewName: "S4_ShoppingCart",
						matchers: new sap.ui.test.matchers.AggregationFilled({
							name: "items"
						}),
						success: function(oSCTab) {
							oQuantityBefore = oSCTab.getItems()[0].getCells()[3].getValue();
							Opa5.assert.ok(oSCTab, "Quatitiy of products present: " + oQuantityBefore);
						}
					});
				},

				iGetCartTotal: function() {
					// get the initial total quantity of the shopping cart   
					var oCartTotalBefore;
					return this.waitFor({
						id: "productListHeaderButton",
						viewName: "S2_ProductList",
						success: function(oCartBtn) {
							oCartTotalBefore = oCartBtn.getText();
							Opa5.assert.ok(oCartBtn, "Shopping cart total: " + oCartTotalBefore);
						}
					});
				},
				
				iSeeProductList: function() {
					return this.waitFor({
						id: "catalogTable",
						viewName: "S2_ProductList",
						matchers: new sap.ui.test.matchers.AggregationFilled({
							name: "items"
						}),
						success: function(oProductList) {
							Opa5.assert.ok(oProductList, "Found the product list view");
						},
						errorMessage: "Did not find the product list"

					});
				},

				iGetProductName: function() {
					// get the product name of the first shopping item  

					return this.waitFor({
						id: "shoppingCartTable",
						viewName: "S4_ShoppingCart",
						matchers: new sap.ui.test.matchers.AggregationFilled({
							name: "items"
						}),
						success: function(oSTab) {
							oProductName = oSTab.getItems()[0].getCells()[2].getContent()[0].getTitle();
							Opa5.assert.ok(oSTab, "Product found: " + oProductName);
						},
						errorMessage: "Did not find the product name in shopping cart table"

					});
				},
				
				iAddProductToCart: function() {

					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: "S2_ProductList",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: "Add to Cart"
						}),
						success: function(oButtons) {
							// add the product to the shopping cart 	 
							oButtons[1].firePress();
						},
						errorMessage: "Unable to click Add to cart button"
					});
				},

				iClickGroupIcon: function() {
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: "S2_ProductList",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "icon",
							value: "sap-icon://group-2"
						}),
						success: function(oIcon) {
							oIcon[0].firePress();
						}
					});
				},

				iClickSortIcon: function() {
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: "S2_ProductList",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "icon",
							value: "sap-icon://sort"
						}),
						success: function(oIcon) {
							oIcon[0].firePress();
						}
					});
				}

			},

			assertions: {

				iCheckCartTotal: function() {
					// get the initial total quantity of the shopping cart   
					var ocartTotalBefore;
					return this.waitFor({
						id: "productListHeaderButton",
						viewName: "S2_ProductList",
						check: function(oPLHeader) {
							// wait until the total quantity has been updated 
							ocartTotalBefore = oPLHeader.getText();
							if (ocartTotalBefore === "0") {
								return true;
							}
							return false;
						},
						success: function(oPLHeader) {
							Opa5.assert.ok(oPLHeader, "Shopping cart total is now zero");
						},
						errorMessage: "Shopping cart total is not set to zero"
					});
				},

				iSeeCheckOutPage: function() {
					this.waitFor({
						id: "checkOutTable",
						viewName: "S5_CheckOut",
						success: function(ocheckOutTable) {
							Opa5.assert.ok(ocheckOutTable, "Page navigated to check out screen successfully with summary of products displayed");
						},
						errorMessage: "Page not navigated to check out screen"
					});
					return this;
				},

				iCheckItemDeletion: function() {
					// Check that the item containing the product has been deleted  
					this.waitFor({
						id: "shoppingCartTable",
						viewName: "S4_ShoppingCart",
						check: function(oSCTab) {
							var oItems = oSCTab.getItems();

							if (oItems.length === 0) {
								return true;
							}

							return false;
						},
						success: function(oSCTab) {

							Opa5.assert.ok(oSCTab, "The shopping item has been deleted");
						},
						errorMessage: "Verification Failed: 'Shopping cart still shows the product'"
					});
					return this;
				},

				iCheckShoppingCartTotal: function() {
					var ocartTotalAfter;
					var ocartTotalBefore;
					// get the total quantity of the shopping cart after addding one piece of product to the cart   
					this.waitFor({
						id: "productListHeaderButton",
						viewName: "S2_ProductList",
						check: function(oCartBtn) {

							ocartTotalAfter = oCartBtn.getText();

							if (ocartTotalAfter !== ocartTotalBefore) {
								return true;
							}
							return false;
						},
						success: function() {
							Opa5.assert.ok(true, "Product added to Shopping cart successfully");
						},
						errorMessage: "Product not added to shopping cart"
					});
					return this;
				},

				iCheckProductName: function() {
					this.waitFor({
						id: "shoppingCartTable",
						viewName: "S4_ShoppingCart",
						check: function() {

							if (oProductName !== sPdtName) {
								return false;
							}
							return true;
						},
						success: function() {
							Opa5.assert.ok(true, "Verification Passed: 'The product is added to cart successfully'");
						},
						errorMessage: "Verification Failed: 'The product is not added to cart successfully'"
					});
					return this;
				},

				iSeeShoppingCart: function() {
					this.waitFor({
						id: "shoppingCartPage",
						viewName: "S4_ShoppingCart",
						success: function(oPageShoppingCart) {

							Opa5.assert.ok(oPageShoppingCart, "Found the shopping cart view");
						},
						errorMessage: "Did not find the shopping cart view"
					});
					return this;
				},

				iSeeProductList: function() {
					// Function to check if the Product List is loaded
					return this.waitFor({
						id: "catalogTable",
						viewName: "S2_ProductList",
						matchers: new sap.ui.test.matchers.AggregationFilled({
							name: "items"
						}),
						success: function(oProductList) {
							Opa5.assert.ok(oProductList, "Found the product list view");
						},
						errorMessage: "Did not find the product list"
					});
				},

				iSeeSortDialog: function() {
					var oOK;
					this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.Button",
						check: function(aButtons) {
							return aButtons.filter(function(oButton) {
								if (oButton.getText() !== "OK") {
									return false;
								}
								oOK = oButton;
								return true;
							});
						},
						success: function() {
							oOK.$().trigger("tap");
							Opa5.assert.ok(true, "Sort Dialog is opened after clicking on Sort icon on the product list view");
						},
						errorMessage: "Did not find the Sort Dialog/OK button"
					});
					return this;
				},

				iSeeGroupDialog: function() {
					var oOK;
					this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.Button",
						check: function(aButtons) {

							return aButtons.filter(function(oButton) {
								if (oButton.getText() !== "OK") {
									return false;
								}

								oOK = oButton;
								return true;
							});
						},
						success: function() {
							oOK.$().trigger("tap");
							Opa5.assert.ok(true, "Group Dialog is opened after clicking on group icon on the product list view");
						},
						errorMessage: "Did not find the Group Dialog/OK button"
					});
					return this;
				}
			}
		}
	});
});