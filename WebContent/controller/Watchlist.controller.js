sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/UIComponent"
], function(Controller, MessageToast, JSONModel,NumberFormat,UIComponent) {
    "use strict";

    let th;
    return Controller.extend("sap.ui.Odata.webapp.controller.Watchlist", {
        onInit: function() {
            th=this;
            this.initCCModel();
            setInterval( this.initCCModel, 10000);      // update the table at every 10 seconds

        },
        initCCModel: function (){
            if(window.location.hash === "#/watchlist") {        // make the update only if user is in the current view
                let sHash = "";
                let baseExchange = sap.ui.getCore().getModel("settings").getData().BaseExchange;
                let gModel = sap.ui.getCore().getModel();

                gModel.read("/WatchlistSet",        //initialize the list of watchlist
                    {
                        success: function (response) {
                            for (let i = 0; i < response.results.length; i++) {
                                sHash = sHash + response.results[i].Currency + ",";
                            }
                            sHash = sHash.substr(0, sHash.length - 1);
                            $.ajax({
                                type: 'GET',
                                url: "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=" + sHash + "&tsyms=" + baseExchange,
                                async: true
                            }).done(function (resp) {
                                if (resp["RAW"] !== undefined) {
                                    let array = {raw: []};


                                    for (let i = 0; i < response.results.length; i++) {
                                        resp["RAW"][response.results[i].Currency][baseExchange].Name = response.results[i].Symbol;
                                        resp["RAW"][response.results[i].Currency][baseExchange].Chart = "https://images.cryptocompare.com/sparkchart/" +
                                            response.results[i].Currency +
                                            "/USD/latest.png?ts=" +
                                            (new Date()).getTime();

                                        array.raw.push(resp["RAW"][response.results[i].Currency][baseExchange])
                                    }
                                    let oModel = new JSONModel(array);
                                    th.getView().setModel(oModel, "CCraw");
                                } else {
                                    th.getOwnerComponent().getRouter().navTo("notFound");
                                }
                            })
                                .fail(function (err) {
                                    if (err !== undefined) {
                                        let oErrorResponse = $.parseJSON(err.responseText);
                                        MessageToast.show(oErrorResponse.message, {
                                            duration: 6000
                                        });
                                    } else {
                                        sap.m.MessageToast.show("Unknown error!");
                                    }
                                });

                        }, error: function (e) {

                        }
                    }
                );
            }

        },
        addCurrency: function(event){       //add a currency to the watchlist
            let oItem = event.getParameter('selectedItem');
            let sKey = oItem ? oItem.getAdditionalText() : '';
            let gModel=sap.ui.getCore().getModel();
            let th=this;
            let mParams = {
                context : null,
                success : function(oData, response) {
                    if(oData.Address===1){
                        MessageToast.show("Something went wrong.")
                    }else{
                        th.initCCModel();
                    }

                },
                error : function(oError) {
                    MessageToast.show("Something went wrong.");
                },
                async : true
            };
            gModel.read("/WatchlistSet",
                {
                    success: function (response) {
                        let appended = response.results.map(function(a) { return (a.Currency === sKey)?1:0;});
                        let present =Number(appended.find(function(a) {return Number(a)!==0 }));
                        console.log(appended)
                        console.log(present)
                        if(present!==1) {  // the currency is not present in the watchlist
                            let cWatchlist={};
                            console.log( response);
                            cWatchlist.Currency = sKey;
                            gModel.create("/WatchlistSet", cWatchlist, mParams);


                        }else {
                            MessageToast.show("Already watched");
                        }


                    }, error: function () {
                    }
                });
            this.byId("watchlistCurrency").setSelectedItem(null);
            this.byId("watchlistCurrency").setValue("");
        },
            removeFromWatchlist: function(oEvent){      //remove the currency from watchlist
            let gModel=sap.ui.getCore().getModel();
            let oRow = oEvent.getSource().getParent();
            let th=this;
            let mParams = {
                context : null,
                success : function(oData, response) {
                    th.byId("watchlistTable").removeItem(oRow);
                },
                error : function(oError) {
                    MessageToast.show("Sometring went wrong.");
                },
                async : true
            };
            let currency=oRow.mAggregations.cells[1].getText();
            gModel.read("/WalletSet",
                {success: function(response){
                        let publicKey=response.results[0].Address;
                        let url= "/WatchlistSet(Address='"+publicKey+"',Currency='"+currency+"')";
                        gModel.remove(url, mParams);
                    }, error: function(e){
                        MessageToast.show("Sometring went wrong.");
                    }
                });

        },

        formatPrice: function (currency) {      //format the price to result API
            let baseExchange= sap.ui.getCore().getModel("settings").getData().BaseExchange;
            let result ="Unknown";
            $.ajax({
                type: 'GET',
                url: "https://min-api.cryptocompare.com/data/price?fsym="+currency+"&tsyms="+baseExchange,
                async: false
            }).done(function(resp) {
                 result = resp[baseExchange];
            }).fail(function(err) {
            });
            return result;
        },
        formatChange: function (currency) {
            let baseExchange= sap.ui.getCore().getModel("settings").getData().BaseExchange;
            let result ="Unknown";
            $.ajax({
                type: 'GET',
                url: "https://min-api.cryptocompare.com/data/price?fsym="+currency+"&tsyms="+baseExchange,
                async: false
            }).done(function(resp) {
                result = resp[baseExchange];
            }).fail(function(err) {
            });
            return result;

        },
        formatCheck: function (da) {
            console.log(da);
        },
        formatChangeH: function (data) {

            let oFloatFormatter = NumberFormat.getFloatInstance({
            	style: "float",
            	decimals: 6
            });
            return oFloatFormatter.format(data);
        },


        onShowDetails: function(id) {		// crypto detail page with parameter
            sap.ui.core.UIComponent.getRouterFor(this).navTo("cdetail",{
                currencyId : id
            });
            sap.ui.controller("sap.ui.Odata.webapp.controller.CryptoDetail", true).initialize();        //call for rerendering the view when other crypto views ware visisted
        },
    });
});

