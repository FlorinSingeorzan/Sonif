sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent",
    "sap/viz/ui5/controls/VizFrame",
    'sap/viz/ui5/format/ChartFormatter',
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/data/DimensionDefinition",
    "sap/viz/ui5/data/MeasureDefinition",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
], function(Controller, History, UIComponent,VizFrame,ChartFormatter,FlattenedDataset,DimensionDefinition,MeasureDefinition,FeedItem) {
    "use strict";
    return Controller.extend("sap.ui.Odata.webapp.controller.MainController", {

        getRouter : function () {
            return UIComponent.getRouterFor(this);
        },
        onNavBack: function () {        //navigate back
            let oHistory, sPreviousHash;

            oHistory = History.getInstance();
            sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("home", {}, true /*no history*/);
            }
        },
        formatJSONDate: function(date,pattern){     // format the date to patter format
            if(pattern === undefined){
               pattern =  "dd MMM yyyy hh:mm:ss";
            }
            let dateT = new Date(date*1000);
            let dateFormat;
            let dateStr;
            try{
                dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern :pattern });
                dateStr = dateFormat.format(dateT);
            }catch(err){
                return "Just Now";
            }

            return dateStr;
        },
        onOriginalPostPage: function(data) {        // redirect to source
            window.open(data, "_blank");
        },
        appendContent: function (settings) {          // create the graph
            let oVizFrame = new VizFrame({
                height: "800px",
                width: "100%",
                vizType: settings.orientation,
                uiConfig: {
                    applicationSet: 'fiori'
                }
            });

            let oDataset = new FlattenedDataset({
                dimensions: new DimensionDefinition({
                    name: settings.timestamp,
                    value: {
                        path:settings.x,
                        formatter: this.formatJSONDate
                    }
                }),
                measures: [
                    new MeasureDefinition({
                        name: "Maximum values",
                        value: settings.y
                    })
                ],
                data: settings.dataset
            });

            oVizFrame.setDataset(oDataset);

            oVizFrame.addFeed(new FeedItem({
                uid: "valueAxis",
                type: "Measure",
                values: [ "Maximum values" ]
            }));

            oVizFrame.addFeed(new FeedItem({
                uid: "categoryAxis",
                type: "Dimension",
                values: [settings.timestamp ]
            }));

            oVizFrame.setVizProperties({
                plotArea: {
                    window: {			//fit the content chart
                        start: "firstDataPoint",
                        end: "lastDataPoint"
                    },
                    showGap: true
                },
                title: {
                    visible: false
                },
                valueAxis: {
                    title: {
                        text: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("chartContainerBitcoinValues") + " " + sap.ui.getCore().getModel("settings").getData().BaseExchange
                    }
                }
            });
            return oVizFrame;
        },
        addPopover: function (vizFrame,popOver) {
            popOver.connect(vizFrame.getVizUid());
        },

        correctPeriod: function (id) {
            let period = this.byId(id);
            period.setValueState(sap.ui.core.ValueState.None);
            if(!(period.getValue()>0 && period.getValue()<2001 && Number.isInteger(parseFloat(period.getValue())))){
                period.setValueState(sap.ui.core.ValueState.Error);
                period.setValueStateText("Invalid Period");
                return false;
            }
            return true;
        },

        msToTime: function(duration) {           // convert time
        let seconds = parseInt((duration / 1000) % 60),
            minutes = parseInt((duration / (1000 * 60)) % 60),
            hours = parseInt((duration / (1000 * 60 * 60)) % 24);
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        return hours + ":" + minutes + ":" + seconds ;
        },

        getCookie: function(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }


        });

});