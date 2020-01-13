baseUrl = "https://widgets.cryptocompare.com/serve/";
var scripts = document.getElementsByName("summary");
var embedder = scripts[scripts.length - 1];
var cccTheme = {
    "General" : {
        "background" : "#fff",
        "borderColor" : "#fff",
        "borderRadius" : "0px",
        "showExport" : true
    },
    "Header" : {
        "background" : "#fafafa",
        "displayFollowers" : false
    },
    "Data" : {
        "borderColor" : "#7eb4ff",
    },
    "PoweredBy" : {
        "textColor":"#fff",
        "linkColor":"#fff"
    },
    "Chart" : {
        "fillColor" : "#7eb4ff",
        "borderColor" : "#2970b0"
    },
    "Tabs": {
        "borderColor" : "#d7d7d7",
        "activeBorderColor": "#2970B0"
    },
    "Highlights":{
        "borderColor" : "#2970b0"
    }

};


function addSummaryContent (sufixURL){

    var appName = encodeURIComponent(window.location.hostname);
    if(appName===""){appName="local";}
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    var theUrl = baseUrl+ sufixURL;
    s.src = theUrl + ( theUrl.indexOf("?") >= 0 ? "&" : "?") + "app=" + appName;
    if (embedder.parentNode.children.length>1){                 // if has a children with tag div remove it (deletes the script element)
        // embedder.parentNode.getElementsByTagName("div")[0].addEventListener('scroll', function() {}, {passive: true});
        embedder.parentNode.removeChild(embedder.parentNode.getElementsByTagName("div")[0]);
        fabric= undefined;
        embedder.parentNode.removeChild(embedder.parentNode.children[1]);
    }
    embedder.parentNode.appendChild(s);
}
