sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		// Create device model 
		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		// Parameter Model
		parameterModel: function() {
			var sSelectParameters = "Name,Price,CurrencyCode,ImageUrl,IsFavoriteOfCurrentUser,StockQuantity";
			sSelectParameters += ",MainCategoryName,SubCategoryName,Id,Description,SupplierName,AverageRating";
			sSelectParameters += ",RatingCount,QuantityUnit,DimensionDepth,DimensionUnit,DimensionWidth";
			sSelectParameters += ",DimensionHeight,WeightMeasure,WeightUnit,HasReviewOfCurrentUser,LastModified";

			var oSelectParameterModel = new JSONModel({
				selectParameterProductDetails: sSelectParameters
			});

			return oSelectParameterModel;
		}
	};
});