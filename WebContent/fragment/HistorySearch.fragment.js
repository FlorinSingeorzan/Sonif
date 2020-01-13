sap.ui.define([
], function() {
	"use strict";

	return sap.ui.jsfragment("sap.ui.Odata.webapp.fragment.HistorySearch", {
		createContent: function(controller) {
			let settings={
				orientation: "column",
				dataset: "{search>/Data}",
				timestamp: "Progress",
				x: "time",
				y: "{close}"
			};

			let oVizFrame =  controller.appendContent(settings);
			let popOver =  controller.getView().byId("popOver");
			controller.addPopover(oVizFrame,popOver);

			return oVizFrame;
		}
	});
});
