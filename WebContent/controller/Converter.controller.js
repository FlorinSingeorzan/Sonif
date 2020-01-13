sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat"
], function(Controller, MessageToast, JSONModel, NumberFormat) {
	"use strict";
	let apikey="452D6443-C0A4-457D-BF94-079DB21CB380";			//gmail

	let bitcoin;
	let ethereum;
	let iota;
	let ripple;
	let dollar;

	function standardDeviation(values){
		var avg = average(values, false);

		var squareDiffs = values.map(function(value){
			var diff = value - avg;
			var sqrDiff = diff * diff;
			return sqrDiff;
		});

		var avgSquareDiff = average(squareDiffs, false);

		var stdDev = Math.sqrt(avgSquareDiff);
		return stdDev;
	}

	function average(data, full){
		var sum = data.reduce(function(sum, value){
			return sum + value;
		}, 0);
		let s;
		if (full)
			s=1;
		else
			s=0;
		var avg = sum / (data.length-1);
		return avg;
	}

	function loadConversion(from,to){			//load the conversion
		let conv;
		$.ajax({
		    type: 'GET',
		    url: "https://rest.coinapi.io/v1/exchangerate/"+from+"/"+to+"?apikey="+apikey, 
		    headers: {
                'Access-Control-Allow-Origin': '*'
            },
		    async: false
		  }).done(function(resp) {
			  conv=resp;	 
		  })
		  .fail(function(err) {
		    if (err !== undefined) {
		      let oErrorResponse = $.parseJSON(err.responseText);
		      sap.m.MessageToast.show(oErrorResponse.message, {
		        duration: 6000
		      });
		    } else {
		      sap.m.MessageToast.show("Unknown error!");
		    }
		  });
		return conv;
	}
	function readConversion(from,to,callback){		// read the actual conversion
		$.ajax({
		    type: 'GET',
		    url: "https://min-api.cryptocompare.com/data/price?fsym="+from+"&tsyms="+to,
		  }).done(function(resp) { 
			  callback(resp);
		  })
		  .fail(function(err) {
		      sap.m.MessageToast.show("Server error!");
		  });
	}

	function convert(value,from){
		readConversion(from,"BTC,ETH,MIOTA,XRP,USD",function(data){
			bitcoin.setValue(value*data.BTC);
			ethereum.setValue(value*data.ETH);
			iota.setValue(value*data.MIOTA);
			ripple.setValue(value*data.XRP);
			dollar.setValue(value*data.USD);
		});
	}
	return Controller.extend("sap.ui.Odata.webapp.controller.Converter", {
		onInit: function() {
			bitcoin=this.byId("bitcoin");
			dollar=this.byId("dollar");
			ethereum=this.byId("ethereum");
			iota=this.byId("iota");
			ripple=this.byId("ripple");
			this.computeSTD()
		},


		computeSTD: function(){
			$.ajax({
				type: 'GET',
				url: "https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=365",
			}).done(function(resp) {
				let source = resp.Data.Data.reverse();
				let arr=source.map((x,y) => x.close);
				let arr2=arr.map((x,y) => Math.log(x / arr[y+1]));
				console.log(source);
				arr2.pop();
				console.log(arr2);
				console.log(standardDeviation(arr2))
				console.log(standardDeviation(arr2)*Math.sqrt(60))

			}).fail(function(err) {

			});
		},



		// fast conversion function
		dollarChange: function (oEvent) {
			let value= dollar.getValue();
			if (value!==""){
				convert(value,"USD");
			}else{
				bitcoin.setValue("");
				ethereum.setValue("");
				iota.setValue("");
				ripple.setValue("");
			}
		},
		bitcoinChange: function (oEvent) {
			let value= bitcoin.getValue();
			if (value!==""){
				convert(value,"BTC");
			}else{
				dollar.setValue("");
				ethereum.setValue("");
				iota.setValue("");
				ripple.setValue("");
			}
		},
		ethereumChange: function (oEvent) {
			let value= ethereum.getValue();
			if (value!==""){
				convert(value,"ETH");
			}else{
				bitcoin.setValue("");
				dollar.setValue("");
				iota.setValue("");
				ripple.setValue("");
			}
		},
		iotaChange: function (oEvent) {
			let value= iota.getValue();
			if (value!==""){
				convert(value,"MIOTA");
			}else{
				bitcoin.setValue("");
				ethereum.setValue("");
				dollar.setValue("");
				ripple.setValue("");
			}
		},
		rippleChange: function (oEvent) {
			let value= ripple .getValue();
			if (value!==""){
				convert(value,"XRP");
			}else{
				bitcoin.setValue("");
				ethereum.setValue("");
				iota.setValue("");
				dollar.setValue("");
			}
		},
		// compute the conversion
		showConversion: function () {
			let from = this.byId("fromCC").getSelectedItem();
			let to = this.byId("toCC").getSelectedItem();
            let amount =Number(this.byId("amountCC").getValue());
            let th=this;
            if (from!=null && to!= null && amount!=null && amount>0){
                let fromCC=from.getAdditionalText();
                let toCC=to.getAdditionalText();
                readConversion(fromCC,toCC,function(data){
                    let amounResult=data[toCC]*amount;
                    let textResult =amount +" "+ from.getText()+" ("+fromCC+")    =    "+ amounResult+" "+to.getText()+" ("+toCC+")";
                    th.byId("resultCC").setText(textResult)

                });
            }else{
                th.byId("resultCC").setText("No Valid Selection")
            }
        }
	});
},true);  