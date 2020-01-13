baseUrl = "https://widgets.cryptocompare.com/";
var scripts = document.getElementsByName("ccoin");
var embedder = scripts[scripts.length - 1];
var cccTheme = {
	"General" : {
		"background" : "rgba(101,134,162,0.9)",
		"borderColor" : "#fff",
		"borderRadius" : "0px"
	},
	"Header" : {
		"background" : "#2c4a65",
		"displayFollowers" : false
	},
	"Followers" : {
		"background" : "#2c4a65",
		"color" : "#2c4a65",
		"borderColor" : "#2c4a65",
		"counterBorderColor" : "#2c4a65",
		"counterColor" : "#2c4a65"
	},
	"Chart" : {
		"fillColor" : "#9abddb"
	}
};

let baseExchange= sap.ui.getCore().getModel("settings").getData().BaseExchange;

function widget(id) {
	var appName = encodeURIComponent(window.location.hostname);
	if (appName === "") {
		appName = "local";
	}
	var s = document.createElement("script");
	s.type = "text/javascript";
	s.async = true;
	var theUrl = baseUrl + 'serve/v1/coin/chart?fsym='+id+'&tsym='+baseExchange;
	s.src = theUrl + (theUrl.indexOf("?") >= 0 ? "&" : "?") + "app=" + appName;
	embedder.parentNode.appendChild(s);

}