sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function( JSONModel) {
	"use strict";

	return sap.ui.jsfragment("sap.ui.Odata.webapp.fragment.BitcoinWeek", {

		createContent: function(controller) {
			let baseExchange= sap.ui.getCore().getModel("settings").getData().BaseExchange;
			let oModel = new JSONModel("https://min-api.cryptocompare.com/data/histoday?fsym=BTC&tsym="+baseExchange+"&limit=7");
            controller.getView().setModel(oModel,"week");
			let settings={
				orientation: "line",
				dataset: "{week>/Data}",
				timestamp: "Bitcoin evolution : last week",
				x: "time",
				y: "{open}"
			};
			return controller.appendContent(settings);
		}
	});
});