sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function(Controller, MessageToast) {
    "use strict";

    return Controller.extend("sap.ui.Odata.webapp.controller.Donate", {

        onInit: function (evt) {
        },


        makeDonation: function () {
            let amount  = Number(this.byId("amount").getValue());
            let gasPrice  = this.byId("gasPrice").getValue();
            let gas  = this.byId("gas").getValue();
            let data  = this.byId("data").getValue();
            let nonce  = this.byId("nonce").getValue();
            if(amount<1e-6){
                MessageToast.show("Specify a valid amount!");
                return;
            }
            // try {
            if (typeof web3 !== 'undefined') {
            	web3 = new Web3(web3.currentProvider);
            } else {
            	// set the provider you want from Web3.providers
            	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
            }

            ethereum.enable();

            web3.eth.defaultAccount = "0x8Ab5Ae79Cee0e470355C0C69780b7626c3755923";
            web3.eth.sendTransaction({
                from: web3.eth.defaultAccount,
                to: '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae',
                // to: '0x8Ab5Ae79Cee0e470355C0C69780b7626c3755923',
                value: web3.toWei(amount, 'ether'),
                // gas: gas,
                // gasPrice: gasPrice,
                // data: data,
                // nonce: nonce,
            }, (err) => {
                console.log(err)
            })
                // }catch(e){}
        }

    });
});

