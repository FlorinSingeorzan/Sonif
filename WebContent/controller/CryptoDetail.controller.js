sap.ui.define([
	"sap/ui/Odata/webapp/controller/MainController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/routing/History"
], function(MainController, MessageToast, JSONModel, NumberFormat,History) {    //tine cont de ordinea de sus
	"use strict";
	let th;
	return MainController.extend("sap.ui.Odata.webapp.controller.CryptoDetail,History", {
		onInit(){
			th=this;
			th.initialize();
			setInterval(this.initialize, 60000)		// refresh the data from server every one minute
		},
		initialize: function() {  		// initialize the page
			let baseExchange= sap.ui.getCore().getModel("settings").getData().BaseExchange;
			let oHashChangerArray = new sap.ui.core.routing.HashChanger().getHash().split("/");
			let sHash = oHashChangerArray[1];
			if(oHashChangerArray[0]==="CurrencyDetails") {		// refresh only if in the current view
				$.ajax({
					type: 'GET',
					url: "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=" + sHash + "&tsyms=" + baseExchange,
					async: true
				}).done(function (resp) {
					if (resp["RAW"] !== undefined) {
						let oModel = new JSONModel(resp["RAW"][sHash][baseExchange]);
						th.getView().setModel(oModel, "rawvalue");
					} else {
						th.getOwnerComponent().getRouter().navTo("notFound");
					}
				})
					.fail(function (err) {
						if (err !== undefined) {
							let oErrorResponse = $.parseJSON(err.responseText);
							MessageToast.show(oErrorResponse.message, {
								duration: 6000
							});
						} else {
							sap.m.MessageToast.show("Unknown error!");
						}
					});
			}
		},
		onNavBack: function () {		//navigate to the last page
			let oHistory = History.getInstance();
			let sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("home", {}, true);
			}
		}
		
	});
});  
