sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function(Controller,MessageToast) {
    "use strict";
    sap.ui.controller("sap.ui.Odata.webapp.controller.Contact",{
        onInit: function() {

        },
        submitRequest: function () {
            let th=this;
            let name = this.byId("name").getValue().replace("&"," and ");
            let email = this.byId("email").getValue();
            let message = this.byId("message").getValue().replace("&"," and ");
            let eRegex = /^(([^<>()\[\]\\.&,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            let correctFormat = eRegex.test(email) && name!=="" && message !== "";
            let http = new XMLHttpRequest();
            http.open("POST", "https://script.google.com/macros/s/AKfycbyNxMytUp8tcN5L7DjM-N1ci3AjHX7M9MyBhqnKKQ/exec", true);      //google spreadsheet app
            http.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            if (correctFormat) {
                th.byId("busySending").setVisible(true);
                th.byId("submitEmail").setEnabled(false);
                let parameters = "name=" + name + "&message=" + message + "&email=" + email + "";
                http.send(parameters);
                http.onload = function () {
                    MessageToast.show("Email sent");
                    th.byId("busySending").setVisible(false);
                    th.byId("submitEmail").setEnabled(true);
                }
            }else {
                MessageToast.show("Wrong request format");

            }
        }
    });
});
