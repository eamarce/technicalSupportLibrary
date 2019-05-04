sap.ui.require(
	[
		"nw/epm/refapps/shop/model/formatter",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/thirdparty/sinon"
	],
	function(formatter, ResourceModel, sinon) {
		"use strict";

		QUnit.test("picture URL", function(assert) {
			var sEmptyURLExpected = "",
				/* eslint-disable */ // using hardcoded URL to test formatter
				sURL = "https://ldci.wdf.sap.corp:44301/sap/opu/odata/sap/SEPMRA_SHOP/Images(ProductId='EPM')/$value",
				/* eslint-enable */
				sPath = "/sap/opu/odata/sap/SEPMRA_SHOP/Images(ProductId='EPM')/$value",
				// Method under test
				imageURL = jQuery.proxy(formatter.imageURL, this._oControlStub);

			// Assert
			assert.strictEqual(imageURL(sURL), sPath, "passing URL");
			assert.strictEqual(imageURL(), sEmptyURLExpected, "empty URL");

		});

		QUnit.test("parse Float", function(assert) {
			var sNumbertring = "3,00",
				sString = "abc",
				iInteger = 3,
				fResult = 3.00,
				// Method under test
				floatParser = jQuery.proxy(formatter.floatParser, this._oControlStub);

			// Assert
			assert.strictEqual(floatParser(sNumbertring), fResult, "parsing string");
			assert.strictEqual(floatParser(iInteger), fResult, "parsing integer");
			assert.strictEqual(isNaN(floatParser(sString)), true, "parsing Letters");
			assert.strictEqual(isNaN(floatParser()), true, "parsing empty");

		});
	});