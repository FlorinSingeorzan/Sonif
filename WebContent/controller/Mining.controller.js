sap.ui.define([
	"jquery.sap.global",
	"sap/ui/Odata/webapp/controller/MainController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(jQuery,MainController , JSONModel, MessageToast) {
	"use strict";

	return MainController.extend("sap.ui.Odata.webapp.controller.Mining", {

		onInit: function (evt) {
			this.initNewsModel();
		},

		initNewsModel: function(){
			var th= this;
			$.ajax({
				type: 'GET',
				url: "https://min-api.cryptocompare.com/data/v2/news/?categories=Mining",
				async: false
			}).done(function(resp) {
				var oModel=new JSONModel(resp);
				th.getView().setModel(oModel,"news");
			})
				.fail(function(err) {
					sap.m.MessageToast.show("Unknown error!");
				});


		},
		onNavButtonPressed: function() {
			this.getOwnerComponent().getRouter().navTo("home");
		},
		formatJSONDate: function (date) {
			arguments[0] = date;
			arguments[1] = "dd.MMM.yyyy";
			return MainController.prototype.formatJSONDate.apply(this,arguments);
		},
		onExit: function () {
			if (this.oQuickView) {
				this.oQuickView.destroy();
			}
		},
		statisticalSelect: function(){
			this.byId("statisticalType").setValueState(sap.ui.core.ValueState.None);
		},
		allHistoryData: function () {
			let enabled = this.byId("sPeriod").getEnabled();
			this.byId("sPeriod").setEnabled(!enabled);
			this.byId("sPeriod").setValue("");
			this.byId("sPeriod").setValueState(sap.ui.core.ValueState.None);
		},
        getStatisticalData: function () {
            let statistic = this.byId("statisticalType");
            let period = this.byId("sPeriod");
            let allData = this.byId("sAllData").getSelected();
            let oModel;
            if(statistic.getSelectedItem()===null ){
                statistic.setValueState(sap.ui.core.ValueState.Error);
                statistic.setValueStateText("Invalid Selection");
                return;
            }
            let chartData= statistic.getSelectedKey();

            if (allData === false){
				arguments[0] = "sPeriod";
				if(!MainController.prototype.correctPeriod.apply(this,arguments)) return;
				let days= Number(period.getValue());
                oModel = new JSONModel("https://api.blockchain.info/charts/"+chartData+"?timespan="+days+"days&format=json&cors=true");
            }else {
				oModel = new JSONModel("https://api.blockchain.info/charts/"+chartData+"?timespan=all&cors=true");
			}
            this.getView().setModel(oModel,"statisticalData");
        },


	});
});

