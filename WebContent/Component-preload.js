// import {wrongCredential} from "./controller/Login.controller";

sap.ui.define([

],
    function() {
    "use strict";

    function getCookie(cname) {
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
    function oDataLoad() {
        let user = getCookie("user");
        let password = getCookie("password");
        if (user === "" || password === "") {
            window.location.href = "home.html";
        } else{
        let oModel = new sap.ui.model.odata.v2.ODataModel("proxy/http/evolhebhdb.evosoft.com:8010/sap/opu/odata/sap/ZFS_SONIF_SRV/", {
            bIncludeExpandEntries: "true",
            user: user,
            password: atob(password)
        });
        oModel.attachMetadataFailed(loginFail);
        sap.ui.getCore().setModel(oModel);
        this.setModel(oModel);
    }
    }oDataLoad();


    function loginFail(oEvent){
        let failStatus = oEvent.getParameters().statusCode;
        if(failStatus===401){
          window.location.href = "home.html";
        }


     }

});