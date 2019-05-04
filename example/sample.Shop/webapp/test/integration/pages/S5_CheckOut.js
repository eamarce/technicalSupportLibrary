sap.ui.define([
	"sap/ui/test/Opa5",
	"nw/epm/refapps/shop/test/integration/pages/Common",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/AggregationFilled",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function(Opa5, Common) {
	"use strict";

	return Opa5.createPageObjects({
		/* eslint-disable */
		onPageS5_CheckOut: {
			/* eslint-enable */
			baseClass: Common,

			actions: {
				// mainly used for the navigation tests

				iBackToCart: function() {
					return this.waitFor({
						id: "backBtn",
						controlType: "sap.ushell.ui.shell.ShellHeadItem",
						actions: function(oShellBackBtn) {
							// nav back
							oShellBackBtn.firePress();
						},
						errorMessage: "Did not find the nav button on S5_CheckOut page"
					});
				},

				iBuyNow: function() {
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: "S5_CheckOut",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: "Buy Now"
						}),
						success: function(oButtons) {
							// Buy now!
							oButtons[0].firePress();
						}
					});
				}
			},

			assertions: {
				iSeeTheCheckOut: function() {
					return this.waitFor({
						id: "checkOutTable",
						viewName: "S5_CheckOut",
						matchers: new sap.ui.test.matchers.AggregationFilled({
							name: "items"
						}),
						success: function(oCOTable) {
							this.getContext().oS5Controller = oCOTable.getParent().getParent().getParent().getParent().getParent().getParent().getParent()
								.getController();
							Opa5.assert.ok(oCOTable, "Found the check out view");
						}
					});
				}
			}
		}
	});
});