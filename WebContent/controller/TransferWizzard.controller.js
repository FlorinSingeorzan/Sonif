sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(jQuery, Controller, JSONModel, MessageToast, MessageBox) {
	"use strict";
	let history = {
			previousSelect: null,
		};
	return Controller.extend("sap.ui.Odata.webapp.controller.TransferWizzard", {
		onInit: function () {
			this._wizard = this.byId("CreateProductWizard");
			this._oNavContainer = this.byId("wizardNavContainer");
			this._oWizardContentPage = this.byId("wizardContentPage");
			this._oWizardReviewPage = sap.ui.xmlfragment("sap.ui.Odata.webapp.fragment.ReviewTransaction", this);
			this._oNavContainer.addPage(this._oWizardReviewPage);
			let oModel = new JSONModel();
			oModel.setProperty("/toComboBoxValue", "");
			oModel.setProperty("/fromComboBoxValue", "");
			oModel.setProperty("/selectedTransactionType", "Exchange");
			oModel.setProperty("/correctAmount", "Error");	
			this.getView().setModel(oModel,"CC");
			this.model=oModel;

        },

		backToWizardContent : function () {			//navigate to the first step
			this._oNavContainer.backToPage(this._oWizardContentPage.getId());
		},

		_handleNavigationToStep : function (iStepNumber) {
			let fnAfterNavigate = function () {
				this._wizard.goToStep(this._wizard.getSteps()[iStepNumber]);
				this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
			}.bind(this);

			this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
			this.backToWizardContent();
		},

		_handleMessageBoxOpen : function (sMessage, sMessageBoxType) {
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						this._handleNavigationToStep(0);
						this._wizard.discardProgress(this._wizard.getSteps()[0]);
					}
				}.bind(this)
			});
			this.clearSelections();
		},

		handleWizardCancel : function () {
			this._handleMessageBoxOpen("Are you sure you want to cancel?", "warning");
		},

		discardProgress: function () {		//discard steps
			let clearContent = function (content) {
				for (let i = 0; i < content.length; i++) {
					if (content[i].setValue) {
						content[i].setValue("");
					}

					if (content[i].getContent) {
						clearContent(content[i].getContent());
					}
				}
			};
			clearContent(this._wizard.getSteps());
		},

		fromCurrencyValidation : function(){		//selection of the type
			let selectedKey = this.getView().getModel("CC").getProperty("/selectedTransactionType");
				switch (selectedKey) {
					case "Transfer" :
						this.byId("FromCurrencyStep").setNextStep(this.getView().byId("TransferStep"));
						break;
					case "Exchange" :
						this.byId("FromCurrencyStep").setNextStep(this.getView().byId("ExchangeStep"));
						break;

			}
		},

		setTransferType: function (){
			if(this.byId("FromCurrencyStep").getNextStep()!=null){
				this.setDiscardableProperty({
					message: "Are you sure you want to change the type ? This will discard your progress.",
					discardStep:this.byId("SelectType"),
					modelPath: "/selectedTransactionType",
					historyPath: "previousSelect"
				});
			}
		},

		setDiscardableProperty : function (params) {		//dialog properties
			let th=this;
			if (this._wizard.getProgressStep() !== params.discardStep) {
				MessageBox.warning(params.message, {
					actions:[MessageBox.Action.YES, MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.YES) {
							this._wizard.discardProgress(params.discardStep);
							history[params.historyPath] = this.getView().getModel("CC").getProperty(params.modelPath);
							th.clearSelections();
						} else {
							this.getView().getModel("CC").setProperty(params.modelPath, history[params.historyPath]);
						}
					}.bind(this)
				});
			} else {
				history[params.historyPath] = this.getView().getModel("CC").getProperty(params.modelPath);
			}
		},
		
		clearSelections: function(){		//clear entered data
			this.byId("fromCurrencyType").setEditable(true);
			this.byId("fromCurrencyAmount").setEditable(true);
			this.byId("fromCurrencyAmount").setValue("");
			this.byId("toTransferAddress").setEditable(true);
			this.byId("toTransferAddress").setValue("");
			this.byId("toCurrencyType").setEditable(true);
			this.byId("entireBalance").setEditable(true);
            sap.ui.getCore().byId("privateKey").setValue("");
		},

		validateTransferAmount: function(){			//validate the amount to transfer
			if(this.byId("fromCurrencyType").getSelectedItem()!=null){
				if (this.byId("entireBalance").getSelected()){
					this.byId("entireBalance").setSelected(false);
				}
				let ccurrency =  this.byId("fromCurrencyType").getSelectedItem().getText();
				let th = this;
				let amount = Number(this.byId("fromCurrencyAmount").getValue());
				let gModel=this.getView().getModel();
				gModel.read("/WalletSet",
							{success: function(response){
								let availableCurrencyAmount = response.results.map(function(a) { return (a.Ddtext === ccurrency)?a.Amount:null;});
								let availableAmount =Number(availableCurrencyAmount.find(function(a) {return Number(a)!==0}));
								th.byId("fromCurrencyAmount").setDescription("Available: " + availableAmount);
								if(availableAmount==null || availableAmount<=0 || availableAmount < amount || amount<=0){
									th.model.setProperty("/correctAmount", "Error");
									th._wizard.invalidateStep(th.byId("FromCurrencyStep"));
								}else{
									th.model.setProperty("/correctAmount", "None");
									th._wizard.validateStep(th.byId("FromCurrencyStep"));
								}
							}, error: function(e){
								th.model.setProperty("/correctAmount", "Error");
								th._wizard.invalidateStep(th.byId("FromCurrencyStep"));
							   }
							});
			}else{
				this._wizard.invalidateStep(this.byId("FromCurrencyStep"));
				this.byId("fromCurrencyAmount").setDescription("Wrong Selection" )
			}
		},
		currencyTypeChange: function(){
			this.validateTransferAmount();
		},
		completeFromCurrencyStep : function(){
			this.fromCurrencyType = this.byId("fromCurrencyType").getSelectedItem();
			this.byId("fromCurrencyType").setEditable(false);
			this.byId("fromCurrencyAmount").setEditable(false);
			this.byId("entireBalance").setEditable(false);
			this.convertAmount();
		},
		convertAmount: function(){		//convert to actual rate
			if (this.byId("toCurrencyType").getSelectedItem()==null){
				this.byId("toCurrencyType").setValueState("Error");
				this._wizard.invalidateStep(this.byId("ExchangeStep"));
			}else{
				this.byId("toCurrencyType").setValueState("None");
				if (this.byId("fromCurrencyType").getSelectedItem()!=null){
				let from = this.byId("fromCurrencyType").getSelectedItem().getAdditionalText();
				let to =  this.byId("toCurrencyType").getSelectedItem().getAdditionalText();
				let amount = Number(this.byId("fromCurrencyAmount").getValue());
				let convertedAmount = this.byId("toCurrencyAmount");
				let th= this;
				$.ajax({
				    type: 'GET',
				    url: "https://min-api.cryptocompare.com/data/price?fsym="+from+"&tsyms="+to, 
				    async: true
				  }).done(function(resp) { 
					 convertedAmount.setValue(resp[to]*amount);
					 th._wizard.validateStep(th.byId("ExchangeStep"));		//validate only when amount is received
				})
				  .fail(function(err) {
				      sap.m.MessageToast.show("Can't get currency conversion!");
				  });
				}
			}
		},
		completeTransferStep: function(){		//finalize transfer step
			if (this.byId("toTransferAddress").getValue().length<33){
				this.byId("reportMessage").setText("Incorrect address!")
			}else{
				let amount =this.byId("fromCurrencyAmount").getValue();
				let ccurency =this.byId("fromCurrencyType").getSelectedItem().getText();
				let csymbol =this.byId("fromCurrencyType").getSelectedItem().getAdditionalText();
				let toAddress =this.byId("toTransferAddress").getValue();
				this.byId("reportMessage").setText("You are about to transfer "+amount+" "+ ccurency + " ("+csymbol+") "+ " to address "+ toAddress+".");
			}
			this.byId("toTransferAddress").setEditable(false)
			
		},
		completeExchangeStep: function(){		//finalize exchange step
			let amount =this.byId("fromCurrencyAmount").getValue();
			let ccurency =this.byId("fromCurrencyType").getSelectedItem().getText();
			let csymbolFrom =this.byId("fromCurrencyType").getSelectedItem().getAdditionalText();
			let toCcurency =this.byId("toCurrencyType").getSelectedItem().getText();
			let csymbolTo =this.byId("toCurrencyType").getSelectedItem().getAdditionalText();
			let receiveAmount =this.byId("toCurrencyAmount").getValue();
			this.byId("reportMessage").setText("You are about to exchange "+amount+" "+ ccurency + " (" + csymbolFrom + ") "  +" with "+ receiveAmount+" "+ toCcurency+ " (" + csymbolTo + ") "  +"." );
			this.byId("toCurrencyType").setEditable(false);
		},
		wizardCompletedHandler: function(){
			sap.ui.getCore().byId("reportFinalMessage").setText(this.byId("reportMessage").getText());
			this._oNavContainer.to(this._oWizardReviewPage);
		},

		logTransaction: function(){		//complete the transaction
			let historyLog={};
			let gModel = this.getView().getModel();
			let selectedKey = this.getView().getModel("CC").getProperty("/selectedTransactionType");
			let mParams = {
					context : null,
					success : function(oData, response) {
						sap.ui.controller("sap.ui.Odata.webapp.controller.Wallet", true).initHistoryTransfer();			// after the transaction succeed update the history timeline by initializing it
						MessageToast.show(oData.PrivateKey);		// in PrivateKey the transaction response is returned
					},
					error : function(oError) {
						MessageToast.show("Something went wrong. Transaction is unregistered!");
					},
					async : true
				};
			let amount = Number(this.byId("fromCurrencyAmount").getValue());
			let from = this.byId("fromCurrencyType").getSelectedItem().getAdditionalText();
			let pKey = sap.ui.getCore().byId("privateKey").getValue();
			historyLog.TransferDate=new Date();		// the date will be completed in the backend system
			historyLog.TrType=selectedKey.toUpperCase();
			historyLog.FromCurrency= from;
			historyLog.Amount= amount;
			let transferSet={};
			transferSet.TransferDate= new Date();
			transferSet.TransactionType = selectedKey.toUpperCase() ;
			transferSet.FromCurrency = from;
			transferSet.TransferAmount= amount ;
			transferSet.PrivateKey=pKey;
			//TODO transfer via api
			switch (selectedKey) {
			case "Transfer" :			//transfer case
				transferSet.ToAddress = this.byId("toTransferAddress").getValue();		//User given transfer address
				if (transferSet.ToAddress==='' || transferSet.FromCurrency==='' || transferSet.TransferAmount.Amount===''){			// verify if not null data
					MessageToast.show("Empty fields");
					return;
				}
				let DataLoaded = gModel.read("/UserSet",			//read valid users info
						{success: function(usersInfo){
							let toCorrectAddress = usersInfo.results.map(function(user) {return (user.Address === transferSet.ToAddress)?user.Address:0;});		// verify if the given address match a valid Sonif address
							if($.inArray(transferSet.ToAddress, toCorrectAddress)!==-1){			//if the address exist
								transferSet.ReceiveAmount= transferSet.TransferAmount;
								transferSet.Rate = 1;
								try{
									gModel.create("/TransferSet", transferSet, mParams);
									gModel.read("/WalletSet") // read wallet set for refreshing the table
								}catch(e){
									MessageToast.show("Something went wrong ")
								}
							}else{
								MessageToast.show("Wrong Transfer Address");
							}
						}, error: function(e){
							MessageToast.show("Failed Transaction");
						   }
						});
				break;
			case "Exchange" :			//exchange case
				let message;
				let to = this.byId("toCurrencyType").getSelectedItem().getAdditionalText();
				transferSet.ToCurrency = to;
				$.ajax({				//request exchange rate
				    type: 'GET',
				    url: "https://min-api.cryptocompare.com/data/price?fsym="+from+"&tsyms="+to, 
				    async: true
				  }).done(function(resp) {
				  	transferSet.Rate = resp[to];		// exchange rate
				  	transferSet.ReceiveAmount = transferSet.TransferAmount * transferSet.Rate;		// compute receive amount
				  	try{
				  		gModel.create("/TransferSet", transferSet, mParams);		// record a transfer
						gModel.read("/WalletSet")				// read wallet set for refreshing the table

				  	}catch(e){
				  		MessageToast.show("Something went wrong ")
				  	}
				  })
				  .fail(function(err) {
					  message= "Failed Transaction";	
					  MessageToast.show(message);
				  });	
				
				break;
			case "Donate" :
				break;
				default:
			}
            this._handleNavigationToStep(0);
            this._wizard.discardProgress(this._wizard.getSteps()[0]);
            this.clearSelections();

		},

        addEntireBalance: function(){		//set all balance for transfer
            if(this.byId("fromCurrencyType").getSelectedItem()!=null){
                let ccurrency =  this.byId("fromCurrencyType").getSelectedItem().getText();
                let th = this;
                let gModel=this.getView().getModel();
                gModel.read("/WalletSet",
                    {success: function(response){
                            let availableCurrencyAmount = response.results.map(function(a) { return (a.Ddtext === ccurrency)?a.Amount:null;});
                            let availableAmount =Number(availableCurrencyAmount.find(function(a) {return Number(a)!==0}));
                            th.byId("fromCurrencyAmount").setValue(availableAmount);
							th.byId("fromCurrencyAmount").setValueState("None");
                            th._wizard.validateStep(th.byId("FromCurrencyStep"));

                        }, error: function(e){
                            th.model.setProperty("/correctAmount", "Error");
                            th._wizard.invalidateStep(th.byId("FromCurrencyStep"));
                        }
                    });
            }else{
                this._wizard.invalidateStep(this.byId("FromCurrencyStep"));
                this.byId("fromCurrencyAmount").setDescription("Wrong Selection" )
            }
        },

		toggleShowKey: function () {
			let pKeyInput = sap.ui.getCore().byId("privateKey");
			let type = pKeyInput.getType() === sap.m.InputType.Password ? sap.m.InputType.Text : sap.m.InputType.Password;		//toggle type
			pKeyInput.setType(type);

		}
	});
});
