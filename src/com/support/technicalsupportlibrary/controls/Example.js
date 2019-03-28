/*!
 * ${copyright}
 */
// Provides control com.support.technicalsupportlibrary.Example.
sap.ui.define(["jquery.sap.global", "./../library", "sap/ui/core/Control", "sap/m/Switch"],
	function (jQuery, library, Control, Switch) {
		"use strict";
		/**
		 * Constructor for a new Example control.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * Some class description goes here.
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @alias com.support.technicalsupportlibrary.controls.Example
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var Example = Control.extend("com.support.technicalsupportlibrary.controls.Example", {
			
			
			
			metadata: {
				library: "com.support.technicalsupportlibrary",
				properties: {

					/**
					 * text
					 */
					text: {
						type: "string",
						group: "Misc",
						defaultValue: null
					}, 
					
					visible:{
						type: "string",
						group: "Misc",
						defaultValue: "none"
						
					}

				},
				aggregations : {
                    _switch      : {type : "sap.m.Switch", multiple : false}   // Agregate button
                     
                },
				events: {
					/**
					 * Event is fired when the user clicks on the control.
					 */
					press: {}

				}
			},
			
			init : function(){   /// init the control
                
                var oSwitch = new  Switch({
                   state: true
                });
                this.setAggregation("_switch", oSwitch);  /// Add aggregation control
                
                var sSupport = jQuery.sap.getUriParameters().get("support");
                
                if(sSupport === "true"){
                	this.setProperty("visible" , "inline-flex");
                }else{
                	this.setProperty("visible" , "inline-flex");
                	//this.setProperty("visible" , "none");
                }
                
			}
			
			

			
		});
		
		return Example;
	}, /* bExport= */ true);