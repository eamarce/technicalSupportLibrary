sap.ui.define([], function() {
	"use strict";

	opaTest("Display rating for an item", function(Given, When, Then) {
		// Actions
		Given.iStartTheApp();
		When.onPageS2_ProductList.iDisplayReviewForFirstProduct();
		When.onPageS2_ProductList.iClickItemProductList();
		// Assertions 
		Then.onPageS3_ProductDetails.iSeeProductDetails();
	});

	opaTest("Favorite checks - I Choose Favorite", function(Given, When, Then) {
		//Actions
		When.onPageS3_ProductDetails.iClickFavorite();
		//Assertions
		Then.onPageS3_ProductDetails.iCheckFavoriteSetOn();
	});

	opaTest("Favorite checks - I do not Choose Favorite", function(Given, When, Then) {
		//Actions
		When.onPageS3_ProductDetails.iClickFavorite();
		//Assertions
		Then.onPageS3_ProductDetails.iCheckFavoriteSetOff();
	});

	opaTest("Open review", function(Given, When, Then) {
		//Actions
		When.onPageS3_ProductDetails.iSeeRatingTable();
		When.onPageS3_ProductDetails.iClickWriteReview();
		//Assertions
		Then.onPageS3_ProductDetails.iSeeReviewDialog();
	});

	opaTest("Write a review", function(Given, When, Then) {
		//Actions
		When.onPageS3_ProductDetails.iSeeRatingTable();
		When.onPageS3_ProductDetails.iWriteReview();
		//Assertions
		Then.onPageS3_ProductDetails.iCheckReviewTable();
	});

	opaTest("Click Rate as Helpful Link", function(Given, When, Then) {
		//Actions
		When.onPageS3_ProductDetails.iClickRateAsHelpful();
		//Assertions
		Then.onPageS3_ProductDetails.iCheckRateAsHelpful();
	});

	opaTest("Edit a review", function(Given, When, Then) {
		//Actions
		When.onPageS3_ProductDetails.iClickEditReview();
		When.onPageS3_ProductDetails.iWriteReview();
		//Assertions
		Then.onPageS3_ProductDetails.iCheckReviewTable();
	});

	opaTest("Delete a review", function(Given, When, Then) {
		//Actions
		When.onPageS3_ProductDetails.iClickDeleteReview();
		//Assertions
		Then.onPageS3_ProductDetails.iCheckReviewTableAfterDeletion();
	});

	opaTest("Open Company card", function(Given, When, Then) {
		//Actions
		When.onPageS3_ProductDetails.iClickCompanyCard();
		//Assertions
		Then.onPageS3_ProductDetails.iSeeCompanyCard();
	});

	opaTest("Open review", function(Given, When, Then) {
		//Actions
		When.onPageS3_ProductDetails.iSeeRatingTable();
		When.onPageS3_ProductDetails.iClickWriteReview();
		//Assertions
		Then.onPageS3_ProductDetails.iSeeReviewDialog();
	});

	opaTest("Write a review", function(Given, When, Then) {
		//Actions
		When.onPageS3_ProductDetails.iWriteReview();
		//Assertions
		Then.onPageS3_ProductDetails.iCheckReviewTable();
	});

	opaTest("Delete a review via edit dialog", function(Given, When, Then) {
		//Actions
		When.onPageS3_ProductDetails.iClickEditReview();
		When.onPageS3_ProductDetails.iClickDeleteIcon();
		//Assertions
		Then.onPageS3_ProductDetails.iCheckReviewTableAfterDeletion().
		and.iTeardownMyAppFrame();
	});

});