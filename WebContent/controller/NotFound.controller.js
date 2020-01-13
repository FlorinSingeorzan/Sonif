sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function(Controller,History) {    //keep the order
	"use strict";

	return Controller.extend("sap.ui.Odata.webapp.controller.NotFound", {
		onInit: function() {  
		},
		onNavBack: function (oEvent) {		//navigate on the last page
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				sap.ui.core.UIComponent.getRouterFor(this).navTo("home", {}, true);
			}
		}
	});
});  