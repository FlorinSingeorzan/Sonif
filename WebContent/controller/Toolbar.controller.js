sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat"
], function(Controller, MessageToast, JSONModel, NumberFormat) {    //keep the order
	"use strict";
	var th;
sap.ui.controller("sap.ui.Odata.webapp.controller.Toolbar", {
	onInit: function() {
		th= this;
	},

	setTab: function(key){
		var iconTabHeader = th.byId('iconTabHeader');
		iconTabHeader.setSelectedKey(key);
	},

	navTo: function (page) {
		this.getOwnerComponent().getRouter().navTo(page);
	},

	logout: function () {
		sap.ui.getCore().getModel().destroy();
		sap.ui.getCore().getModel().destroy();
		document.cookie ="user=;";
		document.cookie ="password=;";
		sessionStorage.clear();
		window.location.href= "home.html";
		MessageToast.show("Login off")
	}
});
});  
