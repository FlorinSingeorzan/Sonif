sap.ui.define([
	"sap/ui/Odata/webapp/controller/MainController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
], function(MainController, MessageToast, JSONModel) {    //tine cont de ordinea de sus
	"use strict";
	let tHistory;
	let th;
	return MainController.extend("sap.ui.Odata.webapp.controller.Wallet", {
		onInit: function() {
			th=this;
            tHistory=this.byId("historyTransaction");
            this.initHistoryTransfer()
		},

		initHistoryTransfer: function(){
			let gModel=sap.ui.getCore().getModel();
			gModel.read("/TransactionsHistorySet",
				{
					success: function (response) {
						let i,year,month,day, time,historyEntry,historyModel, id,len;
						let historySet = [];
						len = response.results.length;
						for ( i = 0; i < len; i++) {
							historySet.push({
								Text: "",
								TransferDate: "",
								Icon: 'sap-icon://share',
								TrType: ""
							});
						}

						for ( i=0; i<len;i++){
							id = response.results[i].LogId-1;
							historySet[i].Text = response.results[i].Text;
							historySet[i].TrType = response.results[i].TrType;
							year = response.results[i].TransferDate.getFullYear();
							month = response.results[i].TransferDate.getMonth()+1;
							day = response.results[i].TransferDate.getDate();
                            arguments[0] =response.results[i].TransferTime.ms;
                            time = 	MainController.prototype.msToTime.apply(this,arguments);		// call the method to transform ms to time from Main Controller
                            month = month<10?'0'+month:month;
                            day = day<10?'0'+day:day;
							historySet[i].TransferDate = year+'.'+month+'.'+day+ ' ' + time;

						}
						historyEntry = {};
						historyEntry.data = historySet;
						historyModel= new JSONModel(historyEntry);
						th.getView().setModel(historyModel,"transferHistory")
					}, error: function (e) {

					},
					async:true
				}
			);
		},
		formatAddress: function(){
			let th=this;
			let oModel= sap.ui.getCore().getModel();
			let DataLoaded = oModel.read("/WalletSet",
					{success: function(response){
						th.byId("address").setText(response.results[0].Address);
						let googleApiQr = "https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl="+response.results[0].Address+"&choe=UTF-8"
						th.byId("qrAddress").setSrc(googleApiQr);
						oModel.setProperty("/currentWalletAdress", response.results[0].Address);
					}, error: function(e){
						th.byId("address").setText("Couldn't retrieve public key");
					   }
					});
			
		},
		onWalletNav: function(event){
			let target=event.getSource().data("target");
			let navCon = this.byId("navCon");
			if (target){
				navCon.to(this.byId(target));
			}
		},
		formatAmount: function(data){
				return parseFloat(data);
		},
		messageLog : function(data){
			let th=this;
			let oModel= sap.ui.getCore().getModel();
			let DataLoaded = oModel.read("/TransactionsHistorySet("+data+")",
					{success: function(response){
						console.log(response);
						return '';	
					}, error: function(e){
						th.byId("address").setText("Couldn't retrive public key");	
					   }
					});
			return data
		},
		iconTransaction: function(data){
			switch (data) {
			case 'BUY':
				return 'sap-icon://forward'
				break;
			case 'SELL':
				return 'sap-icon://response'
				break;		
			case 'INITIAL':
				return 'sap-icon://wallet'
				break;
			case 'EXCHANGE':
				return 'sap-icon://journey-change'
				break;
			case 'TRANSFER':
				return 'sap-icon://step'
				break;
			default:
				return 'sap-icon://share'
				break;
			}
		},
        refreshHistory: function () {
			return tHistory;
        }
	});
});  