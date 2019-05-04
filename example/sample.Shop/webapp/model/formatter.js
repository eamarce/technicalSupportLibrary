sap.ui.define([], function() {
	"use strict";

	return {

		imageURL: function(sURL) {
			return sURL ? URI(sURL).path() : "";
		},
		
		floatParser: function(sValue){
			return parseFloat(sValue);
		},
		
		ratingNumber: function(sRatingNumber) {
			return this.getResourceBundle().getText("xfld.ratingLayout", [sRatingNumber]);
		}
	};
});