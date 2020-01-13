sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat",
	"sap/m/library"
], function(jQuery, Controller, JSONModel, NumberFormat, MobileLibrary) {
	"use strict";
	function botAction(){
		console.log("bot action")
	}
	return Controller.extend("sap.ui.Odata.webapp.controller.Startpage", {
		onInit: function() {
			this.callBot()
			//todo risk page
		},
		formatNumber: function(value) {
			var oFloatFormatter = NumberFormat.getFloatInstance({
				style: "short",
				decimals: 1
			});
			return oFloatFormatter.format(value);
		},
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},

        navigateTo : function(path){
            this.getRouter().navTo(path);
        },

		callBot: function(){
			var currentTime= new Date().getTime()
				, timeAt3pm = currentTime + 10000
				, timeNow = new Date().getTime()
				, offsetMillis = timeAt3pm - timeNow;
			setTimeout(botAction, offsetMillis);
		}

	});
});