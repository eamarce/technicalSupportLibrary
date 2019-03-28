/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library com.support.technicalsupportlibrary.
 */
sap.ui.define(["jquery.sap.global",
		"sap/ui/core/library",
		"sap/base/Log"
	], // library dependency
	function ( global, library, Log ) {

		"use strict";

		/**
		 * A library to provide data context and information when a SAPUI5 library fails
		 *
		 * @namespace
		 * @name com.support.technicalsupportlibrary
		 * @author SAP SE
		 * @version ${version}
		 * @public
		 */

		// delegate further initialization of this library to the Core
		sap.ui.getCore().initLibrary({
			name: "com.support.technicalsupportlibrary",
			version: "${version}",
			dependencies: ["sap.ui.core"],
			types: [],
			interfaces: [],
			controls: [
				"com.support.technicalsupportlibrary.controls.Example"
			],
			elements: []
		});
		
		        com.support.technicalsupportlibrary.oCurrentFunction = {};
		
				com.support.technicalsupportlibrary.activateSupport = function(bIsActive){
				
			    var that = this;	
				
				if(!bIsActive){
					return;
				}
				
				//// Logger component
       			//var oCurrentFunction = {};
				var old; 
				var key;
    			for( key of Object.getOwnPropertyNames(this.__proto__)) {
    			console.log(key);
    	 
    			 
     
    			 old = this.__proto__[key];
    			 
    			 /////
    			 this.__proto__[key] = function(key, old, ...args) {
    		     
    		     //console.log("in function : " + key);
    		     //Log.error("Logging function " + key + " with params: ");

    			 com.support.technicalsupportlibrary.oCurrentFunction.args = args;       
    			 com.support.technicalsupportlibrary.oCurrentFunction.name = key;
     
    			 try{
    		        old.call(this, ...args);
	    		}catch(exception){
			       
			        com.support.technicalsupportlibrary.oCurrentFunction.exception = exception.toString();
		    		com.support.technicalsupportlibrary.oCurrentFunction.logEntries = Log.getLogEntries();
    			    com.support.technicalsupportlibrary.oCurrentFunction.url = window.location.href;
	    			
	    			/* get all SAPUI5 models */
	    			
	    			
	    			
	    			/* get all SAPUI5 models */

	    			
	    		} //.bind(this)
       
    			}.bind(this, key, old);
    			console.log("Binding: key " + key )
    			
    			
			}
			
			
		};

		/* eslint-disable */
		return com.support.technicalsupportlibrary;
		/* eslint-enable */

	}, /* bExport= */ false);