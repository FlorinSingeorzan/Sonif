sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
], function(Controller, JSONModel) {
    "use strict";

    let th;

    function standardDeviation(values){
        let avg = average(values, false);

        let squareDiffs = values.map(function(value){
            let diff = value - avg;
            return diff * diff;
        });
        let avgSquareDiff = average(squareDiffs, false);
        return Math.sqrt(avgSquareDiff);
    }

    function average(data, full){
        let sum = data.reduce(function(sum, value){
            return sum + value;
        }, 0);
        let s;
        if (full)
            s=1;
        else
            s=0;
        return sum / (data.length - 1);
    }


    return Controller.extend("sap.ui.Odata.webapp.controller.Volatility", {
        onInit: function() {
            th=this;
            th.model = new JSONModel();

            // this.computeVolatility();
            th.getView().setModel(th.model, "volatility");
            // let data ={"key": 1, "value": [1,2,3]};
            // let cData = new sap.ui.core.CustomData(data);
            // this.byId("slider").addCustomData(cData);

        },

        onBeforeRendering: function(){
            th.model.setProperty("/from", "BTC");
            th.model.setProperty("/against", "USD");
            th.getEstimation();
        },

        computeVolatility: function () {
            let from  = this.byId("fromCC").getSelectedItem();
            let to = this.byId("toCC").getSelectedItem();
            if (from!=null && to!= null  && from.getAdditionalText()!==to.getAdditionalText()){
                th.byId("vError").setVisible(false);
                let fromCC=from.getAdditionalText();
                let toCC=to.getAdditionalText();
                th.model.setProperty("/from", fromCC);
                th.model.setProperty("/against", toCC);
                th.getEstimation();

            }else{
                th.byId("vError").setVisible(true);
            }

        },

        getEstimation: function(){
            th.computeSTD("histominute","&allData=true", "/daily");
            th.computeSTD("histoday","&limit=30", "/30days");
            th.computeSTD("histoday","&limit=60", "/60days");
            th.computeSTD("histoday","&limit=120", "/120days");
            th.computeSTD("histoday","&limit=365", "/oneYear");
        },

        computeSTD: function(timestamp, limit, mName){
            let from  = th.model.getProperty("/from");
            let to = th.model.getProperty("/against");
            $.ajax({
                type: 'GET',
                url: "https://min-api.cryptocompare.com/data/v2/"+timestamp+"?fsym="+from+"&tsym="+to+limit,
            }).done(function(response) {
                let source = response.Data.Data.reverse();
                let openValues=source.map((x) => x.open);
                let variance=openValues.map((x,y) => Math.log(x / openValues[y+1]));
                variance.pop();
                let estimation = standardDeviation(variance);
                let percentage = Math.trunc(10000*estimation)/100;
                th.model.setProperty(mName, percentage);
                // console.log(mName+"   "+estimation)
            }).fail(function(err) {

            });
        },



    });
});