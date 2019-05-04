/*!
 * ${copyright}
 */
(function () {
    'use strict';

    var DEFAULT_MAX_DEPTH = 6;
    var DEFAULT_ARRAY_MAX_LENGTH = 50;
    var seen; // Same variable used for all stringifications

	/// Pruned JSON will take only certain levels down the JSON objects
    Date.prototype.toPrunedJSON = Date.prototype.toJSON;
    String.prototype.toPrunedJSON = String.prototype.toJSON;

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }

    function str(key, holder, depthDecr, arrayMaxLength) {
        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' && typeof value.toPrunedJSON === 'function') {
            value = value.toPrunedJSON(key);
        }

        switch (typeof value) {
        case 'string':
            return quote(value);
        case 'number':
            return isFinite(value) ? String(value) : 'null';
        case 'boolean':
        case 'null':
            return String(value);
        case 'object':
            if (!value) {
                return 'null';
            }
            if (depthDecr<=0 || seen.indexOf(value)!==-1) {
                return '"-pruned-"';
            }
            seen.push(value);
            partial = [];
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                length = Math.min(value.length, arrayMaxLength);
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value, depthDecr-1, arrayMaxLength) || 'null';
                }
                v = partial.length === 0
                    ? '[]'
                    : '[' + partial.join(',') + ']';
                return v;
            }
            for (k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                    try {
                        v = str(k, value, depthDecr-1, arrayMaxLength);
                        if (v) partial.push(quote(k) + ':' + v);
                    } catch (e) { 
                        // this try/catch due to some "Accessing selectionEnd on an input element that cannot have a selection." on Chrome
                    }
                }
            }
            v = partial.length === 0
                ? '{}'
                : '{' + partial.join(',') + '}';
            return v;
        }
    }

    JSON.pruned = function (value, depthDecr, arrayMaxLength) {
        seen = [];
        depthDecr = depthDecr || DEFAULT_MAX_DEPTH;
        arrayMaxLength = arrayMaxLength || DEFAULT_ARRAY_MAX_LENGTH;
        return str('', {'': value}, depthDecr, arrayMaxLength);
    };

}());

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
		 * @author Edgar Marínez
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
		        
		        com.support.technicalsupportlibrary.sendInformation = function(sRESTUrl, sUser, sPassword){
		        	
		        	try{

                    var http = new XMLHttpRequest();
					
					
					http.open('POST', sRESTUrl, true);

					//Send the proper header information along with the request
					http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
					http.setRequestHeader('Authorization', "Basic " + btoa( sUser + ":" + sPassword ));

					http.onreadystatechange = function() {//Call a function when the state changes.
    					if(http.readyState == 4 && http.status == 200) {
    						  alert(http.responseText);
    				}
					}
					http.send(JSON.pruned( com.support.technicalsupportlibrary.oCurrentFunction, 4, 100) );
                    
                    return true;
                    
		        	}catch(exception){
		        		
		        		console.log("Error " + exception);
		        		return false;
		        		
		        	}
		        	
		        	
		        };
		        

		
				com.support.technicalsupportlibrary.activateSupport = function(oSettings){
				
			    var that = this;	
				
				if(oSettings.bIsActive != "true"){
					return;
				}else{
				    console.log("Support library is activated");
				}
				
				var old; 
				var key;
    			for( key of Object.getOwnPropertyNames(this.__proto__)) {
    			console.log(key);
    	 
    			 
     
    			 old = this.__proto__[key];
    			 
    			
    			 this.__proto__[key] = function(key, old, ...args) {

    			 com.support.technicalsupportlibrary.oCurrentFunction.args = args;       
    			 com.support.technicalsupportlibrary.oCurrentFunction.name = key;
     
    			 try{
    		        old.call(this, ...args);
	    		}catch(exception){
			       
			        com.support.technicalsupportlibrary.oCurrentFunction.exception = exception.toString();
		    		com.support.technicalsupportlibrary.oCurrentFunction.logEntries = Log.getLogEntries();
    			    com.support.technicalsupportlibrary.oCurrentFunction.url = window.location.href;
	    			
	    			
	    			console.log("Sending support information");
	    			/* get all SAPUI5 models */
	    			if(! typeof that.getView() === "undefined" ){
	    				
	    				if(! typeof that.getView().oModels === "undefined" ){
	    					
	    					com.support.technicalsupportlibrary.oCurrentFunction.oModels = [];
	    				
	    				     for (var oModelName in that.getView().oModels) {
    							if (that.getView().oModels.hasOwnProperty(oModelName)) {
        							com.support.technicalsupportlibrary.oCurrentFunction.oModels.push( {modelName: oModelName , data: that.getView().oModels[oModel].getProperty("/") }); 
    							}
							}
	    			         
	    				
	    				}
	    				
	    			}
	    			
	    			if(typeof oSettings.sRESTUrl !== "undefined" && oSettings.sRESTUrl != null && oSettings.sRESTUrl != ""){
	    				com.support.technicalsupportlibrary.sendInformation(oSettings.sRESTUrl, oSettings.sUser, oSettings.sPassword);
	    			}
	    			
	    			
	    			
	    			/*todo: get SAPUI5 models */

	    			
	    		}
       
    			}.bind(this, key, old);
    			console.log("Binding: key " + key )
    			
    			
			}
			
			
		};
		
		com.support.technicalsupportlibrary.activateSupportOnObject = function(oSettings, oObject){
				
				
				if(oSettings.bIsActive != "true"){
					return;
				}else{
				    console.log("Support library is activated");
				}
				
				var old; 
				var key;
    			for( key of Object.getOwnPropertyNames(oObject)) {
    			
    			
    			if(typeof oObject[key] == "function")
    			{
    			
    			
    			console.log(key);
    	 
    			 old = oObject[key];
    			 
    			
    			 oObject[key] = function(key, old, ...args) {

    			 com.support.technicalsupportlibrary.oCurrentFunction.args = args;       
    			 com.support.technicalsupportlibrary.oCurrentFunction.name = key;
     
    			 try{
    		        old.call(oObject, ...args);
	    		}catch(exception){
	    			
	    			console.log("Support library: Error detail can be found in object com.support.technicalsupportlibrary.oCurrentFunction")
			       
			        com.support.technicalsupportlibrary.oCurrentFunction.exception = exception.toString();
		    		com.support.technicalsupportlibrary.oCurrentFunction.logEntries = Log.getLogEntries();
    			    com.support.technicalsupportlibrary.oCurrentFunction.url = window.location.href;
	    			
	    			
	    			console.log("Sending log information");
	    			
	    			
	    			if(typeof oSettings.sRESTUrl !== "undefined" && oSettings.sRESTUrl != null && oSettings.sRESTUrl != ""){
	    				com.support.technicalsupportlibrary.sendInformation(oSettings.sRESTUrl, oSettings.sUser, oSettings.sPassword);
	    			}
	    			
	    			
	    			
	    			/* todo: get all SAPUI5 models */

	    			
	    		}
       
    			}.bind(oObject, key, old);
    			console.log("Binding: key " + key )
    			
    			
			}
			
    			}
			
			return oObject;
			
			
		};

		/* eslint-disable */
		return com.support.technicalsupportlibrary;
		/* eslint-enable */

	}, /* bExport= */ false);