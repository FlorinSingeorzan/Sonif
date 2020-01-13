sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";
    return Controller.extend("sap.ui.Odata.webapp.controller.Summary", {
        onInit: function() {

        },
        addDetailContent: function(prefix, suffix){
            let currencyType = this.obtainCurrencyType();
            if (currencyType!== false) {
                addSummaryContent(prefix+'?fsym='+currencyType+'&tsym'+suffix);
            }
        },


        obtainCurrencyType: function () {
            let typeElement   =   this.getView().byId("sCurrencyType");
            typeElement.setValueState(sap.ui.core.ValueState.None);
            let fiatCoins = typeElement.getSelectedItem().getAdditionalText() === "USD"
                || typeElement.getSelectedItem().getAdditionalText() === "EUR";
            if(typeElement.getSelectedItem()===null || fiatCoins){
                typeElement.setValueState(sap.ui.core.ValueState.Error);
                typeElement.setValueStateText("Invalid Currency");
                return false;
            }
            return  typeElement.getSelectedItem().getAdditionalText();

        }
    });
});