jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
jQuery.sap.require("sap.ui.test.opaQunit");
jQuery.sap.require("sap.ui.test.Opa5");
//Load the Page Objects
jQuery.sap.require("nw.epm.refapps.shop.test.integration.pages.Common");
jQuery.sap.require("nw.epm.refapps.shop.test.integration.pages.S2_ProductList");
jQuery.sap.require("nw.epm.refapps.shop.test.integration.pages.S3_ProductDetails");
jQuery.sap.require("nw.epm.refapps.shop.test.integration.pages.S4_ShoppingCart");
jQuery.sap.require("nw.epm.refapps.shop.test.integration.pages.S5_CheckOut");
jQuery.sap.require("nw.epm.refapps.shop.test.integration.pages.Generic");

sap.ui.test.Opa5.extendConfig({
	arrangements: new nw.epm.refapps.shop.test.integration.pages.Common(),
	viewNamespace: "nw.epm.refapps.shop.view.",
	timeout: 30
});
//Load the journeys
jQuery.sap.require("nw.epm.refapps.shop.test.integration.ShoppingCartJourney");
jQuery.sap.require("nw.epm.refapps.shop.test.integration.ProductListJourney");
jQuery.sap.require("nw.epm.refapps.shop.test.integration.RatingProductJourney"); 
jQuery.sap.require("nw.epm.refapps.shop.test.integration.NavigationJourney");