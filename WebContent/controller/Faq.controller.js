sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.Odata.webapp.controller.Faq", {
		onInit: function() {
		},
		onSelect: function () {
			let bar = this.getView().byId("bar");
		}

	});
});  