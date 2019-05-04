sap.ui.define([], function() {
	"use strict";

	opaTest("Shopping cart checks", function(Given, When, Then) {
		Given.iStartTheApp();
		// Actions
		When.Generic.iSeeProductList();
		When.Generic.iGetCartTotal();
		When.Generic.iGetProductNamePL();
		When.Generic.iAddProductToCart();
		//Asserions
		Then.Generic.iCheckShoppingCartTotal();
	});

	opaTest("Shopping cart validations", function(Given, When, Then) {
		// Actions
		When.Generic.iClickShoppingCart();
		// Assertions
		Then.Generic.iSeeShoppingCart();
	});

	opaTest("Check for product added", function(Given, When, Then) {
		//	Actions
		When.Generic.iGetProductName();
		// Assertions
		Then.Generic.iCheckProductName();
	});

	opaTest("Check if product removed", function(Given, When, Then) {
		//	Actions
		When.Generic.iGetNumberofProducts();
		When.Generic.iChangeQuantity();
		When.Generic.iDeleteProduct();
		// Assertions
		Then.Generic.iCheckItemDeletion().
		and.iTeardownMyAppFrame();
	});

	opaTest("Show the shopping cart", function(Given, When, Then) {
		// Actions
		Given.iStartTheApp();
		When.Generic.iSeeProductList();
		When.Generic.iGetProductNamePL();

		When.Generic.iAddProductToCart();
		When.Generic.iClickShoppingCart();

		// Assertions
		Then.Generic.iSeeShoppingCart();
	});
	opaTest("Show checkout page", function(Given, When, Then) {
		//	Actions
		When.Generic.iGetProductName();
		When.Generic.iClickCheckOut();
		// Assertions
		Then.Generic.iSeeCheckOutPage();
	});

	opaTest("Show product list view and check for cart total", function(Given, When, Then) {
		//	Actions
		When.Generic.iClickBuyNow();
		When.Generic.iSeeProductList();
		// Assertions
		Then.Generic.iCheckCartTotal().
		and.iTeardownMyAppFrame();
	});

});