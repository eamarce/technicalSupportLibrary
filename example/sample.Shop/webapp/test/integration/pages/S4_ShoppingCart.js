sap.ui.define([
	"sap/ui/test/Opa5",
	"nw/epm/refapps/shop/test/integration/pages/Common",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function(Opa5, Common) {
	//variable
	"use strict";

	// Total quantity before addding a product to cart
	var oQuantityBefore;
	// Total quantity after addding a product to cart
	var oQuantityAfter;
	// a selected product name
	var oProductName;

	return Opa5.createPageObjects({
		/* eslint-disable */
		onPageS4_ShoppingCart: {
			/* eslint-enable */
			baseClass: Common,

			actions: {
				// mainly used for the navigation tests
				iGoToCheckOut: function() {
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: "S4_ShoppingCart",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: "Go to Checkout"
						}),
						success: function(oButtons) {
							// go to the checkout	 
							oButtons[0].firePress();
						}
					});
				},

				iBackToPD: function() {
					return this.waitFor({
						id: "backBtn",
						controlType: "sap.ushell.ui.shell.ShellHeadItem",
						actions: function(oShellBackBtnS4) {
							// nav back
							oShellBackBtnS4.firePress();
						},
						errorMessage: "Did not find the nav button on S4_ShoppingCart page"
					});
				},

				// mainly used for shopping cart function tests
				iGetQuantityBC: function() {
					// get the quantity of the first shopping item before a change       
					return this.waitFor({
						id: "shoppingCartTable",
						viewName: "S4_ShoppingCart",
						matchers: new sap.ui.test.matchers.AggregationFilled({
							name: "items"
						}),
						success: function(oSTab) {
							oQuantityBefore = oSTab.getItems()[0].getCells()[3].getValue();
						}
					});
				},
				iChangeQuantity: function() {
					// Change the quantity of the first shopping item   
					return this.waitFor({
						id: "shoppingCartTable",
						viewName: "S4_ShoppingCart",
						matchers: new sap.ui.test.matchers.AggregationFilled({
							name: "items"
						}),
						success: function(oSTab) {
							// add 2 to the total quantity of the first shopping item
							var oQuantityAfterNum = Number(oQuantityBefore) + 2;
							oQuantityAfter = String(oQuantityAfterNum);
							oSTab.getItems()[0].getCells()[3].setValue(oQuantityAfter);
						}
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
							oProductName = oSTab.getItems()[0].getCells()[2].getTitle();
						}
					});
				},
				iDeleteItem: function() {
					// Delete the first shopping item
					return this.waitFor({
						id: "shoppingCartTable",
						viewName: "S4_ShoppingCart",
						matchers: new sap.ui.test.matchers.AggregationFilled({
							name: "items"
						}),
						success: function(oSTab) {
							oSTab.getItems()[0]._oDeleteControl.firePress();
						}
					});
				}
			},

			assertions: {
				iSeeTheShoppingCart: function() {
					this.waitFor({
						id: "shoppingCartPage",
						viewName: "S4_ShoppingCart",
						success: function(oPageSC) {
							this.getContext().oS4Controller = oPageSC.getParent().getController();
							Opa5.assert.ok(oPageSC, "Found the shopping cart view");
						}
					});
					return this;
				},
				iCheckQuantity: function() {
					this.waitFor({
						id: "shoppingCartTable",
						viewName: "S4_ShoppingCart",
						check: function(oSTab) {
							// wait until the quantity of the first shopping item has been updated
							var oQuantityIs = oSTab.getItems()[0].getCells()[3].getValue();
							if (oQuantityIs === oQuantityAfter) {
								return true;
							}
							return false;
						},
						success: function(oSTab) {
							var oQuantityIs = oSTab.getItems()[0].getCells()[3].getValue();
							Opa5.assert.strictEqual(oQuantityAfter, oQuantityIs, "The quantity of the first shopping item has been changed");
						}
					});
					return this;
				},
				iCheckItemDeletion: function() {
					// Check that the item containing the product has been deleted  
					this.waitFor({
						id: "shoppingCartTable",
						viewName: "S4_ShoppingCart",
						check: function(oSTab) {
							var oItems = oSTab.getItems();
							// select the item for the current user
							for (var i = 0; i < oItems.length; i++) {
								if (oItems[i].getCells()[2].getTitle() === oProductName) {
									return false;
								}
							}
							return true;
						},
						success: function(oSTab) {
							var oItemDeleted = true;
							var oItems = oSTab.getItems();
							// select the item for the current user
							for (var i = 0; i < oItems.length; i++) {
								if (oItems[i].getCells()[2].getTitle() === oProductName) {
									oItemDeleted = false;
									break;
								}
							}
							Opa5.assert.ok(oItemDeleted, "The shopping item has been deleted");
						}
					});
					return this;
				}
			}
		}
	});
});