// In mock mode, the mock server intercepts HTTP calls and provides fake output to the
// client without involving a backend system. But special backend logic, such as that 
// performed by function imports, is not automatically known to the mock server. To handle
// such cases, the app needs to simulate this backend logic by using standard HTTP requests
// (that are again interpreted by the mock server) as shown below. 
// There are two ways to do this:
//  a)  If the mock server does not provide a handler function for a request the app can define
//      its own handler function and add it to the mock server's handler functions. This is the
//      case for function import requests. In this example a list of the app specific handler
//      functions is returned by function Request.getRequests and added to the mock server 
//      handlers in Service.init
//  b)  If additional tasks have to be performed before or after a standard mock request 
//      handler has run the app can attach call back functions to the respective request. The
//      app can define if the call back is to be performed before or after the mock server's 
//      request hanlder
// Please note:
// The usage of synchronous calls is only allowed in this context because the requests are
// handled by a latency-free client-side mock server. In production coding, asynchronous
// calls are mandatory.

sap.ui.define(["sap/ui/base/Object", "sap/ui/core/util/MockServer"], function(Object, MockServer) {
	"use strict";

	return Object.extend("nw.epm.refapps.shop.test.service.MockRequests", {

		constructor: function(oMockServer) {
			this._srvUrl = "/sap/opu/odata/sap/SEPMRA_SHOP/"; //service url
			this._oMockServer = oMockServer;
			this._initRequestCallbacks();
		},

		_initRequestCallbacks: function() {
			this._oMockServer.attachAfter(MockServer.HTTPMETHOD.MERGE, this.onRateAsHelpful.bind(this), "Reviews");
			this._oMockServer.attachAfter(MockServer.HTTPMETHOD.POST, this.onCreateReview.bind(this), "Reviews");
			this._oMockServer.attachBefore(MockServer.HTTPMETHOD.DELETE, this.onDeleteReview.bind(this), "Reviews");
			this._oMockServer.attachAfter(MockServer.HTTPMETHOD.MERGE, this.onChangeReview.bind(this), "Reviews");
			this._oMockServer.attachAfter(MockServer.HTTPMETHOD.MERGE, this.onMergeShoppingCartItems.bind(this), "ShoppingCartItems");
			this._oMockServer.attachBefore(MockServer.HTTPMETHOD.DELETE, this.onDeleteShoppingCartItems.bind(this), "ShoppingCartItems");
		},

		getRequests: function() {
			// This method is called by the webIDE if the app is started in mock mode with the 
			// option "AddCustom Mock Requests". It returns the list of app specific mock requests.
			// The list is added to the mock server's own list of requests
			return [this._mockAddProductToShoppingCart(), this._mockBuyShoppingCart()];
		},

		_mockAddProductToShoppingCart: function() {
			return {
				// This mock request handles the "AddProductToShoppingCart" function
				// The following steps are performed:
				// - Create a shopping cart for the user if none exists yet. This is
				// not done here because the built-in mock data already contains a 
				// shopping cart.
				// - Update the total quantity property of the shopping cart
				// - Create a new shopping cart item if there is no item yet that
				// contains the added product. If such an
				// item already exists, update its quantity and value accordingly.
				method: "POST",
				path: new RegExp("AddProductToShoppingCart\\?ProductId=(.*)"),
				response: function(oXhr, sUrlProductId) {
					var oShoppingCart = this._oMockServer.getEntitySetData("ShoppingCarts")[0],
						aShoppingCartItems = this._oMockServer.getEntitySetData("ShoppingCartItems"),
						oShoppingCartItem = null,
						sProductId = decodeURIComponent(sUrlProductId);
					sProductId = sProductId.substring(1, sProductId.length - 1);

					// check if there is already a shopping cart item for this product.
					oShoppingCartItem = this._findFirst("ProductId", sProductId, aShoppingCartItems);
					if (oShoppingCartItem) {
						// there is already an item for this product -> just increase the quantity and the subtotal of this item and update the totals on the shopping cart accordingly
						oShoppingCartItem.SubTotal = (oShoppingCartItem.SubTotal / oShoppingCartItem.Quantity) * (oShoppingCartItem.Quantity + 1);
						oShoppingCartItem.Quantity++;
						oShoppingCart.Total = +oShoppingCart.Total + (oShoppingCartItem.SubTotal / oShoppingCartItem.Quantity);
						// update the Shopping Cart Item with the new quantity
						aShoppingCartItems[this._indexOfObject("ProductId", sProductId, aShoppingCartItems)] = oShoppingCartItem;
						this._oMockServer.setEntitySetData("ShoppingCartItems", aShoppingCartItems);
					} else {
						// There is no item for this product in the cart yet -> create one, the necessary data can be found in the product
						var aProducts = this._oMockServer.getEntitySetData("Products"),
							oProduct = this._findFirst("Id", sProductId, aProducts),
							sId = this._getNewItemId(aShoppingCartItems);

						oShoppingCartItem = {
							Id: sId,
							ProductId: oProduct.Id,
							CurrencyCode: oProduct.CurrencyCode,
							Quantity: 1,
							ShoppingCartId: -1,
							SubTotal: oProduct.Price,
							Unit: oProduct.QuantityUnit,
							"__metadata": {
								"id": this._oMockServer.getRootUri() + "ShoppingCartItems" + "('" + sId + "')",
								"uri": this._oMockServer.getRootUri() + "ShoppingCartItems" + "('" + sId + "')",
								"type": "SEPMRA_SHOP.ShoppingCartItem"
							},
							Product: {
								__deferred: {
									uri: this._oMockServer.getRootUri() + "ShoppingCartItems" + "('" + sId + "')/" + "Product"
								}
							}
						};
						// create a Shopping Cart Item for the selected product 
						aShoppingCartItems.push(oShoppingCartItem);
						this._oMockServer.setEntitySetData("ShoppingCartItems", aShoppingCartItems);

					}

					// also update the shopping cart accordingly
					oShoppingCart.TotalQuantity++;
					oShoppingCart.Total = +oShoppingCart.Total + +oShoppingCartItem.SubTotal;

					// update the shopping cart totals
					this._oMockServer.setEntitySetData("ShoppingCarts", [oShoppingCart]);

					oXhr.respondJSON(200, {}, JSON.stringify({
						d: {
							ProductId: sProductId
						}
					}));
					return true;
				}.bind(this)
			};
		},

		onRateAsHelpful: function(oEvt) {
			// This call back is used when the "Rate as Helpful" button of a review
			// is pressed. It increases the "Helpful" count of the review by 1 and sets
			// the HelpfulForCurrentUser indicator to true
			var oReview = oEvt.getParameter("oEntity"),
				aReviews = this._oMockServer.getEntitySetData("Reviews"), //get the complete review data from the mock server
				oReviewFull = this._findFirst("Id", oReview.Id, aReviews),
				d = 1;                                  //change to the number of helpful votes done by this request (1 or -1)

			//check if this is really a "RateAsHelpful" request and return if not
			if (!oReview.hasOwnProperty("HelpfulForCurrentUser")) {
				return;
			}else if (!oReview.HelpfulForCurrentUser) {
				d = -1;
			}

			//Update the Review with the new helpful count and flag the review as "HelpfulForCurrentUser"
			oReview = oReviewFull;
			oReview.HelpfulCount = oReview.HelpfulCount + d;
			oReview.HelpfulForCurrentUser = true;
			this._oMockServer.setEntitySetData("Reviews", aReviews);
		},

		onChangeReview: function(oEvt) {
			// This function is called when the a review is changed.
			// The following actions are performed:
			// for Product:
			// - calculate and set the new average rating
			// for ReviewAggregation:
			// - update the number of ratings
			var oChangedReview = oEvt.getParameter("oEntity"),
				aReviews = this._oMockServer.getEntitySetData("Reviews"), //get the complete review data from the mock server
				oReview = this._findFirst("Id", oChangedReview.Id, aReviews);

			//check if this is a "RateAsHelpful" and leave if it is one - those are handled in "onRateAsHelpful"
			if (!oReview.IsReviewOfCurrentUser) {
				return;
			}

			//update the product
			var aProducts = this._oMockServer.getEntitySetData("Products"),
				oProduct = this._findFirst("Id", oReview.ProductId, aProducts),
				aReviewsForProduct = this._find("ProductId", oProduct.Id, aReviews),
				iRatingValueSum = oChangedReview.Rating;
			for (var i = 0; i < aReviewsForProduct.length; i++) {
				if (aReviewsForProduct[i].Id !== oChangedReview.Id) {
					iRatingValueSum = iRatingValueSum + aReviewsForProduct[i].Rating;
				}
			}
			oProduct.AverageRating = iRatingValueSum / oProduct.RatingCount;
			this._oMockServer.setEntitySetData("Products", aProducts);

			//update the ReviewAggregates entity set 
			var aReviewAggregates = this._oMockServer.getEntitySetData("ReviewAggregates"),
				aReviewAggregatesProduct = this._find("ProductId", oReview.ProductId, aReviewAggregates),
				oReviewAggregateOld = this._findFirst("Rating", oReview.Rating, aReviewAggregatesProduct),
				oReviewAggregateNew = this._findFirst("Rating", oChangedReview.Rating, aReviewAggregatesProduct);
			oReviewAggregateOld.RatingCount--;
			oReviewAggregateNew.RatingCount++;
			this._oMockServer.setEntitySetData("ReviewAggregates", aReviewAggregates);
		},
		onDeleteReview: function(oEvt) {
			// The following actions need to be performed when a review is deleted:
			// - update the RatingCount and the AverageRating of the product
			// - update the RatingCount of the ReviewAggregate

			//Get the rating data from the server before it is deleted
			var oXhr = oEvt.getParameter("oXhr"),
				sReviewGuid = oXhr.url.substring(oXhr.url.indexOf("'") + 1, oXhr.url.lastIndexOf("'")),
				oReview = this._findFirst("Id", sReviewGuid, this._oMockServer.getEntitySetData("Reviews"));

			//update the product
			var aProducts = this._oMockServer.getEntitySetData("Products"),
				oProduct = this._findFirst("Id", oReview.ProductId, aProducts);
			oProduct.bHasOwnReview = false;
			oProduct.AverageRating = (oProduct.AverageRating * oProduct.RatingCount - oReview.Rating) / (oProduct.RatingCount - 1);
			oProduct.RatingCount--;
			this._oMockServer.setEntitySetData("Products", aProducts);

			//update the ReviewAggregates entity set 
			var aReviewAggregates = this._oMockServer.getEntitySetData("ReviewAggregates"),
				aReviewAggregatesProduct = this._find("ProductId", oReview.ProductId, aReviewAggregates),
				oReviewAggregate = this._findFirst("Rating", oReview.Rating, aReviewAggregatesProduct);
			oReviewAggregate.RatingCount--;
			this._oMockServer.setEntitySetData("ReviewAggregates", aReviewAggregates);
		},

		onCreateReview: function(oEvt) {
			// This function is called when a review is created. The following actions are performed:
			// for Product:
			// - set the bHasOwnReview indicator to true
			// - calculate and set the new average rating
			// - increase the RatingCount 1
			// for ReviewAggregation:
			// - increase the counter corresponding to the new rating by 1
			// for Review
			// - complete the review data
			var oDate = new Date(), // needed to create time stamp for the new review,
				oNewReview = oEvt.getParameter("oEntity"),
				aProducts = this._oMockServer.getEntitySetData("Products"),
				oProduct = null;

			//Get the reviewed product and update it according to the review
			oProduct = this._findFirst("Id", oNewReview.ProductId, aProducts);
			oProduct.bHasOwnReview = true;
			oProduct.AverageRating = (oProduct.AverageRating * oProduct.RatingCount + oNewReview.Rating) / (oProduct.RatingCount + 1);
			oProduct.RatingCount++;
			this._oMockServer.setEntitySetData("Products", aProducts);

			//update the ReviewAggregates entity set 
			var aReviewAggregates = this._oMockServer.getEntitySetData("ReviewAggregates"),
				aReviewAggregatesProduct = this._find("ProductId", oNewReview.ProductId, aReviewAggregates),
				oReviewAggregate = this._findFirst("Rating", oNewReview.Rating, aReviewAggregatesProduct);
			oReviewAggregate.RatingCount++;
			this._oMockServer.setEntitySetData("ReviewAggregates", aReviewAggregates);

			// new reviews are not automatically created with all needed data - fill the gaps
			oNewReview.ChangedAt = "\/Date(" + oDate.getTime() + ")\/";
			oNewReview.HelpfulCount = 0;
			oNewReview.HelpfulForCurrentUser = false;
			oNewReview.IsReviewOfCurrentUser = true;
			oNewReview.UserDisplayName = "Test User";
		},

		onMergeShoppingCartItems: function(oEvt) {
			// This mock request updates the totals on the shopping cart when the
			// quantity field in of a shopping cart item is manually changed. This
			// is necessary because the the calculation of the totals and the update
			// of the shopping cart is not directly triggered by a http request.
			// Instead the back end does it automatically during the processing of a
			// http merge request for a shopping cart item
			this._calcCartTotalsFromItems(oEvt, "MERGE");

		},
		onDeleteShoppingCartItems: function(oEvt) {
			// This mock request updates the totals on the shopping cart when a
			// shopping cart item is deleted. This
			// is necessary because the the calculation of the totals and the update
			// of the shopping cart is not
			// directly triggered by a http request. Instead the back end does it
			// automatically during the
			// processing of a http delete request for a shopping cart item
			this._calcCartTotalsFromItems(oEvt, "DELETE");
		},

		_indexOfObject: function(sAttribute, searchValue, aSearchList) {
			// Searches in an array of objects for a given attribute value and returns the index of the first matching object
			for (var i = 0; i < aSearchList.length; i++) {
				if (aSearchList[i][sAttribute] === searchValue) {
					return i;
				}
			}
			return -1;
		},

		_find: function(sAttribute, value, aSearchList, bLeaveEarly) {
			// Searches in an array of objects for a given attribute value and returns all matching objecsts in an array.
			// If bLeaveEarly is set to true only the first match will be returned
			var aResult = [];
			for (var i = 0; i < aSearchList.length; i++) {
				if (aSearchList[i][sAttribute] === value) {
					aResult.push(aSearchList[i]);
				}
				if (aResult.length === 1 && bLeaveEarly) {
					break;
				}
			}
			return aResult;
		},

		_findFirst: function(sAttribute, value, aSearchList) {
			// Searches in an array of objects for a given attribute value and returns the first match.
			var aMatches = this._find(sAttribute, value, aSearchList, true);
			if (aMatches.length > 0) {
				return aMatches[0];
			}
			return null;
		},

		_calcCartTotalsFromItems: function(oEvt, sHttpMethod) {
			// In this mock function request the total on the shopping cart are updated
			// by adding up the the values of the shopping cart items. The http method
			// is not yet defined because the same logic is needed for "MERGE" and
			// "DELETE" calls. See function "onDeleteShoppingCartItems" and
			// "onMergeShoppingCartItems"
			var sItemId = "",
				oChangedItemNewData = oEvt.getParameter("oEntity"),
				oShoppingCart = this._oMockServer.getEntitySetData("ShoppingCarts")[0],
				aShoppingCartItems = this._oMockServer.getEntitySetData("ShoppingCartItems"),
				oChangedItemServerData = null,
				aProducts = [],
				oProduct = null;

			if (sHttpMethod === "MERGE") {
				sItemId = oChangedItemNewData.Id;
				// get the complete data of the changed item 
				oChangedItemServerData = this._findFirst("Id", sItemId, aShoppingCartItems);

			} else {
				var oXhr = oEvt.getParameter("oXhr");
				//Find the item that will be deleted: Get the item key from the request url
				sItemId = oXhr.url.substring(oXhr.url.indexOf("'") + 1, oXhr.url.lastIndexOf("'"));
			}
			// get the complete data of the changed item 
			oChangedItemServerData = this._findFirst("Id", sItemId, aShoppingCartItems);

			//read the items's product to get the price per piece
			aProducts = this._oMockServer.getEntitySetData("Products");
			oProduct = this._findFirst("Id", oChangedItemServerData.ProductId, aProducts);

			//update the totals on the shopping cart
			oShoppingCart.TotalQuantity = oShoppingCart.TotalQuantity - oChangedItemServerData.Quantity + ((oChangedItemNewData) ?
				oChangedItemNewData.Quantity : 0);
			oShoppingCart.Total = oShoppingCart.Total - oChangedItemServerData.Quantity * oProduct.Price + ((oChangedItemNewData) ?
				oChangedItemNewData.Quantity : 0) * oProduct.Price;
			this._oMockServer.setEntitySetData("ShoppingCarts", [oShoppingCart]);

			//adopt the items's value to the new quantity and write the changes to the mock server data
			if (sHttpMethod === "MERGE") {
				oChangedItemServerData.SubTotal = (oProduct.Price * oChangedItemNewData.Quantity).toString();
				this._oMockServer.setEntitySetData("ShoppingCartItems", aShoppingCartItems);
			}
		},

		_mockBuyShoppingCart: function() {
			return {
				// This mock request simulates the function import "BuyShoppingCart",
				// which is triggered when the "Buy Now" button is chosen on the
				// Checkout view.
				// It removes all items from the shopping cart and sets the totals on
				// the shopping cart to 0.		    
				method: "POST",
				path: new RegExp("BuyShoppingCart"),
				response: function(oXhr) {
					var aShoppingCarts = [];

					// Set totals on shopping cart to 0 -> there is only one shopping cart...
					aShoppingCarts = this._oMockServer.getEntitySetData("ShoppingCarts");
					aShoppingCarts[0].Total = "0";
					aShoppingCarts[0].TotalQuantity = "0";
					aShoppingCarts = this._oMockServer.setEntitySetData("ShoppingCarts", aShoppingCarts);

					// remove all shopping cart items
					this._oMockServer.setEntitySetData("ShoppingCartItems", []);

					oXhr.respondJSON(200, {}, JSON.stringify({
						d: {
							results: []
						}
					}));

					return true;
				}.bind(this)
			};
		},

		_getNewItemId: function(aExistingItems) {
			// Creates a new Id as a string
			// aIdsInUse -  is a mandatory import parameter - it contains the already
			//              existing shopping cat items - their Ids need to be excluded
			// returns a new Id as astring
			var sNewId = null,
				iItemCount = aExistingItems.length;

			while (sNewId === null) {
				sNewId = ((iItemCount + 1) * 10).toString();
				if (this._findFirst("Id", sNewId, aExistingItems)) {
					sNewId = null;
					iItemCount++;
				}
			}
			return sNewId;
		}
	});

});