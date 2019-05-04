sap.ui.define([], function() {
	"use strict";

	// Show the product list view
	opaTest("Show the product list", function(Given, When, Then) {
		// Arrangements
		Given.iStartTheApp();

		// Assertions
		Then.onPageS2_ProductList.iSeeTheProductList();
	});

	// Show the product detail view
	opaTest("Show the product detail", function(Given, When, Then) {
		// Actions
		When.onPageS2_ProductList.iChooseTheFirstProd();

		// Assertions
		Then.onPageS3_ProductDetails.iSeeTheProductDetail();
	});

	// Show the shopping cart view
	opaTest("Show the shopping cart", function(Given, When, Then) {
		// Actions
		When.onPageS3_ProductDetails.iAddToCart();
		When.onPageS3_ProductDetails.iClickShoppingCart();

		// Assertions
		Then.onPageS4_ShoppingCart.iSeeTheShoppingCart();
	});

	// Show the check out view
	opaTest("Show the check out", function(Given, When, Then) {
		// Actions
		When.onPageS4_ShoppingCart.iGoToCheckOut();

		// Assertions
		Then.onPageS5_CheckOut.iSeeTheCheckOut();
	});

	// Back to the shopping cart view again
	opaTest("Back to the shopping cart", function(Given, When, Then) {
		// Actions
		When.onPageS5_CheckOut.iBackToCart();

		// Assertions
		//Then.onPageS4_ShoppingCart.iSeeTheShoppingCart();
		Then.onPageS4_ShoppingCart.iSeeTheShoppingCart().and.iTeardownMyAppFrame();
	});

// (Trouble with back button of the shell ctrl)
	// // Back to the product detail view again (optionl)
	// opaTest("Back to the product detail", function(Given, When, Then) {
	// 	// Actions
	// 	When.onPageS4_ShoppingCart.iBackToPD();

	// 	// Assertions
	// 	Then.onPageS3_ProductDetails.iSeeTheProductDetail();
	// });

	// // Back to the product list view again (optionl)
	// opaTest("Back to the product list", function(Given, When, Then) {
	// 	// Actions
	// 	When.onPageS3_ProductDetails.iBackToPL();

	// 	// Assertions
	// 	Then.onPageS2_ProductList.iSeeTheProductList().
	// 	and.iTeardownMyAppFrame();
	// });

});