sap.ui.define(
		[
		"sap/ui/Odata/webapp/controller/MainController",
		"sap/ui/core/format/DateFormat" ,
		"sap/m/MessageToast"
		],
		function(MainController, DateFormat,MessageToast) {
			"use strict";
			let th;

			return MainController.extend("sap.ui.Odata.webapp.controller.Reviews",
					{
						onInit : function() {
							th=this;
						},
						addReview : function() {		//add a review
							let timeline =th.byId("timeline");
							let newR = {};
							newR.UserName = timeline.getContent()[0].getAggregation("embeddedControl").getAggregation("items")[0].getValue();
							newR.Rating = timeline.getContent()[0].getAggregation("embeddedControl").getAggregation("items")[1].getValue();
							newR.Quote = timeline.getContent()[0].getAggregation("embeddedControl").getAggregation("items")[3].getValue();
							newR.ReviewDate = new Date();
							newR.Template = false ;
							if (newR.UserName==='' || newR.Quote===''){
								MessageToast.show("Empty fields");
								return;
							}
							if (newR.Quote.length >999 || newR.UserName.length >19){
								MessageToast.show("Name or Comment to long");
								return;
							}
							let oModel = this.getView().getModel();
							let mParams = {
								context : null,
								success : function(oData) {
									MessageToast.show(oData.Quote);		// the server status is returned in quote
								},
								error : function() {
									MessageToast.show("Failed to post the review");
								}
							};
							try{
							oModel.create("/ReviewsSet", newR, mParams);
							}catch(e){MessageToast.show("Something went wrong")}
						},
						formatDate: function (template,date, msTime) {
							if (template) {
								return "Add a review";
							}
							arguments[0] =msTime.ms;
							let time = 	MainController.prototype.msToTime.apply(this,arguments);		// call the method to transform ms to time from Main Controller
							let year = date.getFullYear();
							let month = date.getMonth()+1;
							let day = date.getDate();
							month = month<10?'0'+month:month;
							day = day<10?'0'+day:day;
							return  year+'.'+month+'.'+day+ ' ' + time
						}


					});
});


