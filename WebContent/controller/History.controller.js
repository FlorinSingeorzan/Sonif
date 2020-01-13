sap.ui.define([
    "sap/ui/Odata/webapp/controller/MainController",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/json/JSONModel",
	'sap/m/Dialog',
	'sap/m/Button',
	'sap/m/Text',
], function(MainController,NumberFormat,JSONModel,Dialog,Button,Text) {
	"use strict";
	return MainController.extend("sap.ui.Odata.webapp.controller.History", {
		onInit: function(){
		},
		onNavButtonPressed: function() {		// navigation to Startpage
			let oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("home");
		},
        formatJSONDate: function (date) {			//parse the date
            arguments[0] = date;
            arguments[1] = "dd.MMM.yyyy";
            return MainController.prototype.formatJSONDate.apply(this,arguments);
        },
		formatNumber: function(value) {			// parse value to 4 digits
			return parseFloat((+value).toFixed(4).replace(/\.0+$/,''));
		},
		allHistoryData: function () {
			let enabled = this.byId("hPeriod").getEnabled();
			this.byId("hPeriod").setEnabled(!enabled);
			this.byId("hPeriod").setValue("");
			this.byId("hPeriod").setValueState(sap.ui.core.ValueState.None);
		},
		getHistoricalData : function(){
			let type = this.byId("hCurrencyType");
			let oModel;
			let baseExchange= sap.ui.getCore().getModel("settings").getData().BaseExchange;
			let period = this.byId("hPeriod");
			let allData = this.byId("hAllData").getSelected();
			let fiatCoins = type.getSelectedItem().getAdditionalText() === "USD"
				|| type.getSelectedItem().getAdditionalText() === "EUR";
			if(type.getSelectedItem()===null || fiatCoins){
				type.setValueState(sap.ui.core.ValueState.Error);
				type.setValueStateText("Invalid Currency")
				return;
			}
			if (allData === false){
				 arguments[0] = "hPeriod";
				 if(!MainController.prototype.correctPeriod.apply(this,arguments)) return;
				let days= Number(period.getValue());
				 oModel = new JSONModel("https://min-api.cryptocompare.com/data/histoday?fsym="+type.getSelectedItem().getAdditionalText()+"&tsym="+baseExchange+"&limit="+days);
			}else {
				oModel = new JSONModel("https://min-api.cryptocompare.com/data/histoday?fsym="+type.getSelectedItem().getAdditionalText()+"&tsym="+baseExchange+"&allData=true");

			}
			this.getView().setModel(oModel,"search");
		},
		hCurrencySelect: function () {
			this.byId("hCurrencyType").setValueState(sap.ui.core.ValueState.None);
		},





	});

});