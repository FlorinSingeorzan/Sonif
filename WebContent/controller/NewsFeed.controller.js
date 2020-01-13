sap.ui.define([
	"jquery.sap.global",
	"sap/ui/Odata/webapp/controller/MainController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat",
	"sap/m/FeedListItem",
	"sap/m/FeedListItemAction"
], function(jQuery, MainController, MessageToast, JSONModel, NumberFormat,FeedListItem,FeedListItemAction) {    //tine cont de ordinea de sus
	"use strict";

	return MainController.extend("sap.ui.Odata.webapp.controller.NewsFeed", {
		onInit: function() {
			var th= this;
			// som()
			this.initNewsModel();
			let oTemplate= new sap.m.FeedListItem({
				id: "sapFLI",
				sender : "{Content}",
				text : "{Text}",
				iconActive: true,
				icon : "{ImageLink}",
				info : "{Source}",
				timestamp : "{ApparitionDate}", // string
				iconDensityAware: false, // boolean
				showIcon : true, // boolean
				convertLinksToAnchorTags : sap.m.LinkConversion.All,
				iconPress : th.onOriginalPostPage,
				senderPress : th.onOriginalPostPage

			});
		},
        initNewsModel: function(){
			var th= this;
            $.ajax({
                type: 'GET',
                url: "https://min-api.cryptocompare.com/data/v2/news/?lang=EN",
                async: false
            }).done(function(resp) {
				var oModel=new JSONModel(resp);
                th.getView().setModel(oModel,"news");
            })
                .fail(function(err) {
                	sap.m.MessageToast.show("Unknown error!");
                });


		},

		onNavButtonPressed: function() {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("home");
		},

	});
});  