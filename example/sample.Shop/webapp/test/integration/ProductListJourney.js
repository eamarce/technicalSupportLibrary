sap.ui.define([], function() {
	"use strict";

	// It checks for sort dialog is opened
	opaTest("Check Sort Dialog", function(Given, When, Then) {
		// Act
		Given.iStartTheApp();
		// Actions
		When.Generic.iClickSortIcon();
		// Assertions
		Then.Generic.iSeeSortDialog();
		Then.Generic.iSeeProductList();
	});
	// it checks if personalisation dialog is opened
	opaTest("Should click personalization button", function(Given, When, Then) {
		//Actions
		When.onPageS2_ProductList.iClickP1();
		//Assertions
		Then.onPageS2_ProductList.iSeeCancel();
	});

	// It checks for group dialog is opened
	opaTest("Check Group Dialog", function(Given, When, Then) {
		// Actions
		When.Generic.iClickGroupIcon();
		// Assertions
		Then.Generic.iSeeGroupDialog();
		Then.Generic.iSeeProductList().
		and.iTeardownMyAppFrame();
	});

});