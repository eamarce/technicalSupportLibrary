sap.ui.define([
		"sap/ui/test/Opa5"
	],
	function(Opa5) {
		"use strict";

		function getFrameUrl(sHash, sUrlParameters) {
			var sUrl = jQuery.sap.getResourcePath("nw/epm/refapps/shop/app", ".html");
			var sNewHash = sHash || "";
			var sNewUrlParameters = sUrlParameters ? "?" + sUrlParameters : "";

			if (sNewHash) {
				sNewHash = "#EPMProduct-shop&/" + (sNewHash.indexOf("/") === 0 ? sNewHash.substring(1) : sNewHash);
			} else {
				sNewHash = "#EPMProduct-shop";
			}

			return sUrl + sNewUrlParameters + sNewHash;
		}

		return Opa5.extend("nw.epm.refapps.shop.test.integration.pages.Common", {

			iStartTheApp: function(oOptions) {
				var oNewOptions = oOptions || {};
				this.iStartMyAppInAFrame(getFrameUrl(oNewOptions.hash));
			},

			iStartTheAppWithDelay: function(sHash, iDelay) {
				this.iStartMyAppInAFrame(getFrameUrl(sHash, "serverDelay=" + iDelay));
			},

			iLookAtTheScreen: function() {
				return this;
			},

			iStartMyAppOnADesktopToTestErrorHandler: function(sParam) {
				this.iStartMyAppInAFrame(getFrameUrl("", sParam));
			},

			createAWaitForAnEntitySet: function(oOptions) {
				return {
					success: function() {
						var bMockServerAvailable = false,
							aEntitySet;

						this.getMockServer().then(function(oMockServer) {
							aEntitySet = oMockServer.getEntitySetData(oOptions.entitySet);
							bMockServerAvailable = true;
						});

						return this.waitFor({
							check: function() {
								return bMockServerAvailable;
							},
							success: function() {
								oOptions.success.call(this, aEntitySet);
							}
						});
					}
				};
			},

			getMockServer: function() {
				return new Promise(function(success) {
					Opa5.getWindow().sap.ui.require(["sap/test/localService/mockserver"], function(mockserver) {
						success(mockserver.getMockServer());
					});
				});
			}

		});
	}
);