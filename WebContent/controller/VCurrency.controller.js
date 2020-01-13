sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat"
], function(Controller, MessageToast, JSONModel, NumberFormat) {    
	"use strict";
	var th;
	var oPersonalizationDialog;
	return Controller.extend("sap.ui.Odata.webapp.controller.VCurrency", {
		onInit: function() {
			th=this;
		},
		variable: {},
		onOK: function(oEvent) {
			oEvent.getSource().close();			//added
			oEvent.getSource().destroy();
		},
		onClose: function(oEvent) {		// destroy the Dialog
			oPersonalizationDialog.destroy()
		},
		onShowDetails: function(oEvent) {		// crypto detail page with parameter
			sap.ui.core.UIComponent.getRouterFor(this).navTo("cdetail",{
				currencyId : oPersonalizationDialog.id
			});
			sap.ui.controller("sap.ui.Odata.webapp.controller.CryptoDetail", true).initialize();		//call for rerendering the view when other crypto ware press
		},
		onRefresh: function(){
			oPersonalizationDialog.rerender();
			widget(oPersonalizationDialog.id);
		},
		showCrypto: function(title,symbol){		//show Cryprocurrency Dialog
			th.renderCurrency(title,symbol);
			let calle=widget(symbol);
		},
		renderCurrency: function(title,id) {		// call the fragment and show the wiget
			oPersonalizationDialog = sap.ui.xmlfragment("sap.ui.Odata.webapp.fragment.PersonalizationDialog", this);
			this.getView().addDependent(oPersonalizationDialog);
			oPersonalizationDialog.open();
			oPersonalizationDialog.attachAfterClose(th.onClose);
			oPersonalizationDialog.setTitle(title);
			oPersonalizationDialog.id=id;
		}
	});
});  
