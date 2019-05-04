/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global"],

	function ( /*jQuery*/ ) {
		"use strict";

		/**
		 * Example renderer.
		 * @namespace
		 */
		var ExampleRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided
		 * {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm
		 *            the RenderManager that can be used for writing to
		 *            the Render-Output-Buffer
		 * @param {sap.ui.core.Control} oControl
		 *            the control to be rendered
		 */
		ExampleRenderer.render = function (oRm, oControl) {

            
			oRm.write("<div");
			oRm.writeControlData(oControl);
			oRm.addClass("sapRULTExample");
			oRm.writeClasses();
			oRm.write(" style='display:" + oControl.getVisible() + " '>"   );
			
			oRm.write("<div style='padding-top: 15px; padding-right: 5px;'>");
			oRm.writeEscaped("Enable support?");
			oRm.write("</div>");
			
			
			oRm.renderControl(oControl.getAggregation("_switch"));  /// pass aggregated control for rendering
           
			
			oRm.write("</div>");

		};

		return ExampleRenderer;

	}, /* bExport= */ true);