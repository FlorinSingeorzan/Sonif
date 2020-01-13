sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function(JSONModel) {
	"use strict";

	return sap.ui.jsfragment("sap.ui.Odata.webapp.fragment.BitcoinMonth", {

		createContent: function(controller) {
			let baseExchange= sap.ui.getCore().getModel("settings").getData().BaseExchange;
			let oModel = new JSONModel("https://min-api.cryptocompare.com/data/histoday?fsym=BTC&tsym="+baseExchange+"&limit=31");
			controller.getView().setModel(oModel,"month");
			let settings={
				orientation: "line",
				dataset: "{month>/Data}",
				timestamp: "Bitcoin evolution: Last Month",
				x: "time",
				y: "{close}"
			};
			return controller.appendContent(settings);
		}
	});
});
