let th;
let user;
let pass;
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("sap.ui.Odata.webapp.controller.Login", {
        onInit: function() {
            th=this;
        },

    });
});

function loginUser() {
    user = document.getElementsByName("username")[0].value;
    pass = btoa(document.getElementsByName("password")[0].value);
    document.cookie =  "user="+user+";";
    document.cookie =  "password="+pass+";";
    verifyLogin();

}

function wrongCredentials(visibility , text){
    if(text===undefined){
        text = "Invalid username or password"
    }
    th.byId("invalidMessage").setVisible(visibility);
    th.byId("invalidMessage").setText(text);
}

function verifyLogin() {
    if (user === "" || pass === "") {
        wrongCredentials(true, "Provide both Username and Password")
    }else {

        let oModel = new sap.ui.model.odata.v2.ODataModel("proxy/http/evolhebhdb.evosoft.com:8010/sap/opu/odata/sap/ZFS_SONIF_SRV/", {
            bIncludeExpandEntries: "true",
            user: user,
            password: atob(pass)
        });
        oModel.attachMetadataFailed(loginFail);
        oModel.attachMetadataLoaded(loginSuccess);
        // sap.ui.getCore().setModel(oModel);
        // th.setModel(oModel);
    }
}


function loginFail(oEvent){
    let failParameters = oEvent.getParameters();
    let failStatus =  failParameters.statusCode;
    console.log(failStatus);
    if(failStatus===401){
        wrongCredentials(true)
    }
}

function loginSuccess(oEvent){
    oEvent.getSource().destroy()
    wrongCredentials(false)
    window.location.href = "index.html";
}

window.onload = function() {
    let cta = document.querySelector(".cta");
    let counter=0;

    cta.addEventListener('click', function (e) {
        let text = document.querySelector(".loginForm");
        let loginText = document.querySelector(".loginHeader")
        // let sonifText = document.querySelector(".sonifText")
        // sonifText.classList.toggle('sonifLogin');
        text.classList.toggle('show-hide');
        loginText.classList.toggle('expand');
        wrongCredentials(false);
        if(counter === 0){
            cta.innerHTML = "<img alt='Login' src='images/home.png'/>";
            counter++;
        }else{
            cta.innerHTML = "<i >Login</i>";
            counter=0;
        }
    })
};