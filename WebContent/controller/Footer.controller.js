sap.ui.define([
    "sap/ui/core/mvc/Controller",
], function(Controller) {
    "use strict";
    sap.ui.controller("sap.ui.Odata.webapp.controller.Footer", {
        onInit: function() {
        },
        navigateTo : function(path){
            this.getOwnerComponent().getRouter().navTo(path);
        },
        onPoweredBy: function() {       // to Sapui5 page
            window.open("https://sapui5.hana.ondemand.com", "_blank");
        }
    });
});
