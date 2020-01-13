sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/m/MessageToast",
], function(UIComponent,JSONModel,Device,MessageToast) {
	"use strict";

	return UIComponent.extend("sap.ui.Odata.webapp.Component", {

		metadata: {
			manifest: "json"
		},

		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			var th = this;
			// create the views based on the url/hash
			var oModel= sap.ui.getCore().getModel();
			if (oModel ===undefined || oModel===null){
				console.log("no data");
				return;
			}
			this.setModel(oModel);	// set the default model to project
            console.log(oModel);
            this.initCoinsModel();
            this.initSettingsModel();
			// set device model
			var DataLoaded = oModel.read("/LoginSet",
					{success: function(response){
						var result = response.results[0].Id;
						if (result === '0'){
							MessageToast.show("Welcome");

						}
						else if (result === '1') {
							th.getRouter().navTo("notFound");
						}
						else{
							th.showInitialMessage(result);
						}
					}, error: function(e){
						MessageToast.show("Something went wrong");
					   }
					});
			this.getRouter().initialize();		// it goes to init method on the  loading view
		
		},
		createContent: function() {
			// create root view
			return sap.ui.view("AppView", {
				viewName: "sap.ui.Odata.webapp.view.App",
				type: "XML"
			});
		},

		 showInitialMessage: function (key) {
			let element = new sap.m.Label({
				text: 'This is your wallet private key. Copy it in your file and don\'t share it with anybody!',
				design: 'Bold'
			});
			let dialog = new sap.m.Dialog({
				title: 'New Account',
				type: 'Message',
				state: 'Success',
				content: [
				new sap.m.VBox({
					items: [
					new sap.m.Text({
							text: 'A new account was linked to your ID',
							class: 	"sapUiSmallMarginBottom"
						}),		
					new sap.m.Label({
						text: 'This is your wallet private key. Copy it in your file and don\'t share it with anybody!',
						design: 'Bold',
						class: 	'sapUiSmallMargin'
					}),
					new sap.m.MessageStrip({
						showIcon: true,		
						text: key,
						class: 	'sapUiSmallMarginBottom'
					}),
					new sap.m.Text({
					text: '*This key is important for making transactions and to be recognize as the owner of your wallet.',
					class: 	'sapUiSmallMarginBottom'
						
					}),
					
					]
				})
				],
				beginButton: new sap.m.Button({
					text: 'OK',
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
		},
		initCoinsModel : function () {			// declare the model for accepted currencies in app
			let gModel =  sap.ui.getCore().getModel();
			let th= this;
			gModel.read("/CurrencySet",
				{success: function(response){
						let coinsModel = new JSONModel({"currencies": response.results});
						th.setModel(coinsModel, "Coins")
					}, error: function(e){
						let pathCurrency = jQuery.sap.getModulePath("sap.ui.Odata.webapp.model.data", "/Currencies.json");
						let conversionModel =  new JSONModel(pathCurrency);
						th.setModel(conversionModel, "Coins");
					}
				});
			if(th.getModel("Coins")===undefined){
				let pathCurrency = jQuery.sap.getModulePath("sap.ui.Odata.webapp.model.data", "/Currencies.json");
				let conversionModel =  new JSONModel(pathCurrency);
				th.setModel(conversionModel, "Coins");
			}
		},

		initSettingsModel: function(){
			let settings = {
				"MemNewsCategories": true,
				"ConWalletContent": false,
				"ConWlistContent": false,
				"BaseExchange": "USD",
				"NoNews":1,
				"Nickname": "The User"
			};
			let jsonSetting = new JSONModel(settings);
			this.setModel(jsonSetting, "settings");
			sap.ui.getCore().setModel(jsonSetting, "settings");
		}
	});
});