sap.ui.define([
	"sap/ui/model/json/JSONModel",
], function(JSONModel) {
	"use strict";

	return sap.ui.jsfragment("sap.ui.Odata.webapp.fragment.BitcoinAll", {
	
		createContent: function(controller) {
			let baseExchange= sap.ui.getCore().getModel("settings").getData().BaseExchange;
			// let oModel = new JSONModel("https://api.blockchain.info/charts/market-price?timespan=all&format=json&cors=true"/*,controller.fnSuccess,controller.fnError*/);
			let oModel = new JSONModel("https://min-api.cryptocompare.com/data/histoday?fsym=BTC&tsym="+baseExchange+"&allData=true");
			controller.getView().setModel(oModel,"all");
			let settings={
				orientation: "column",
				dataset: "{all>/Data}",
				timestamp: "Bitcoin evolution",
				x: "time",
				y: "{close}"
			};
			return controller.appendContent(settings);
		}
	});
});
