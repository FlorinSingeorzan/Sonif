sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function( JSONModel) {
    "use strict";

    return sap.ui.jsfragment("sap.ui.Odata.webapp.fragment.MiningStatistics", {
        createContent: function(controller) {

            let oModel = new JSONModel("https://api.blockchain.info/charts/hash-rate?timespan=31days&format=json&cors=true");
            controller.getView().setModel(oModel,"statisticalData");
            let settings={
                orientation: "line",
                dataset: "{statisticalData>/values}",
                timestamp: "Hash rate",
                x: "x",
                y: "{y}"
            };
            let vizFrame = controller.appendContent(settings);
            let popOver =  controller.getView().byId("popOver");
            controller.addPopover(vizFrame,popOver);
            return vizFrame;

        },
    });
});