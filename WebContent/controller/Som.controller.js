sap.ui.define([
    "sap/ui/Odata/webapp/controller/MainController",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/NumberFormat",
    'sap/viz/ui5/format/ChartFormatter',
    'sap/viz/ui5/api/env/Format'
], function(MainController, MessageToast, JSONModel, NumberFormat,ChartFormatter,Format) {    //tine cont de ordinea de sus
    "use strict";


    const width = 8,        // the width of the lattice
        height = 8,         // the height of the lattice
        numIteration = 300, // the number of epochs
        initialLearningRate = 0.5,      // the initial learning rate
        gOffset = 3;        // randing offset

    let matrix =[];
    let categoryList=[];

    class Node{             // the node for the matrix

        constructor(length,dx,dy) {

            this.dx=dx;
            this.dy=dy;
            this.length=length;
            this.initWeight()       // weight initialization

        }

        initWeight(){            // method for weight initialization
            this.weights =JSON.parse(JSON.stringify(Array()));
            for (let entry=0;entry<this.length;entry++){
                this.weights[entry]= Math.random();
            }

        }

        getDistance(inputVector){       // Euclidian Distance
            var distance =0;
            for (let i in this.weights){
                distance+=(inputVector[i]-this.weights[i])*(inputVector[i]-this.weights[i]);
            }
            return Math.sqrt(distance);
        }

    }

    function createGroup(objectArray, property,delimiter) {             // create the group for property
        return objectArray.reduce(function (acc, obj) {
            let category = JSON.parse(JSON.stringify(obj[property]));
            let keys = category.split(delimiter);
            let lCase;
            for (let index in keys) {
                lCase = keys[index].toLowerCase();
                if (!acc[lCase]) {
                    acc[lCase] = 0;
                }
            }
            return acc;

        }, {});
    }

    function oneHotEncoding(objectArray,list, property,delimiter) {         // encode the vector
        return objectArray.map( entity => {
            let copyList =JSON.parse(JSON.stringify(list));
            let category = entity[property];
            let keys = category.split(delimiter);
            let lCase;
            for (let index in keys) {/////      //for all categories
                lCase = keys[index].toLowerCase();
                if(copyList[lCase]!== undefined){
                    copyList[lCase]=1;
                }
                // break;                       //for only one category
            }
            entity["cList"] = copyList;
            return entity;

        })
    }

    function encodePreferences(preferences, categories) {           // encode vector of preferences
        let preferencesVector = JSON.parse(JSON.stringify(categories));
        let keys = preferences.split("|");
        let lCase;
        for (let index in keys) {
            lCase = keys[index].toLowerCase();
            if(preferencesVector[lCase]!== undefined){
                preferencesVector[lCase] =1
            }
        }
        return preferencesVector;
    }
    function shuffleArray(array) {              // Durstenfeld shuffle
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function rgbToHex(r,g,b) {          // convert for color
        return  '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex
        }).join('')
    }


      function som(apiData,th, preferences) {
          categoryList = createGroup(apiData, 'categories', "|");
          let data = extractEncoding(apiData);
          let dataLength = data[0].length;
          let mapRadius = Math.max(width, height) / 2;
          let lambda = numIteration / Math.log(mapRadius);
          let len = data.length;

          for (let i = 0; i < width; i++) {       //create the matrix
              matrix[i] = [];
              for (let j = 0; j < height; j++) {
                  matrix[i][j] = new Node(dataLength, i, j);
              }
          }

          let iteration,
              record,
              i, j,
              dx, dy,
              itWeight,

              neighbourRadius,
              learningRate,
              influence,
              widthSq,
              distanceToNode,
              oldWeight,
              shuffleDataset;
              for (iteration = 0; iteration < numIteration; iteration++) {      //training
                  shuffleDataset = shuffleArray(JSON.parse(JSON.stringify(data))); // get random data from array
                  for (record = 0; record < len; record++) {
                      [dx, dy] = computeBMU(matrix, shuffleDataset[record]);    //compute BMU
                      neighbourRadius = mapRadius * Math.exp(-iteration / lambda);
                      learningRate = initialLearningRate * Math.exp(-iteration / numIteration);        // modify the parameters
                      distanceToNode = 0;
                      widthSq = 0;
                      influence = 0;
                      oldWeight = 0;
                      for (i = 0; i < width; i++) {
                          for (j = 0; j < height; j++) {        // go through the matrix to find neighbours
                              distanceToNode = (dx - i) * (dx - i) + (dy - j) * (dy - j);
                              widthSq = neighbourRadius * neighbourRadius;
                              if (distanceToNode < widthSq) {       // if neighbour
                                  influence = Math.exp(-distanceToNode / (2 * widthSq));
                                  for (itWeight = 0; itWeight < matrix[i][j].length; itWeight++) {
                                      oldWeight = matrix[i][j]["weights"][itWeight];
                                      matrix[i][j]["weights"][itWeight] = oldWeight + influence * learningRate * (shuffleDataset[record][itWeight] - oldWeight);        // update the weights
                                  }
                              }
                          }
                      }
                  }
              }
          let matrixSet = [],
              resultSet,
              finalSet = [],
              colorSet = [];

          let emptySet = {
              x: 0,
              y: 0,
              dimension: 0,
              categories: "",
          };

          for (i = 0; i < len; i++) {
              matrixSet.push(JSON.parse(JSON.stringify(emptySet)));     //create the matrix set
          }

          for (let i = 0; i < width; i++) {       //create the matrix
              colorSet[i] = [];
              for (let j = 0; j < height; j++) {
                  colorSet[i][j] = {}
              }
          }

          let cDominant = [];

          for (record = 0; record < len; record++) {        // compute results
              [dx, dy] = computeBMU(matrix, data[record]);
              matrixSet[record]["x"] = dx + gOffset;
              matrixSet[record]["y"] = dy + gOffset;
              matrixSet[record]["dimension"] = 10;
              if (apiData[record]["categories"].indexOf("|") === -1 && cDominant.indexOf(apiData[record]["categories"]) === -1) {
                  cDominant.push({
                      "categories": apiData[record]["categories"],
                      "x": dx,
                      "y": dy
                  });
              }
              matrixSet[record]["categories"] = apiData[record]["categories"];
          }
          resultSet= computeResultSet(apiData,data);        // compute the result set

          for (let ent in resultSet) {
              finalSet.push(resultSet[ent])
          }
          th.getView().byId("idVizFrame").setVizScales([{
              'feed': 'color',
              'palette': ['#83b6e2',]

          }]);

          finalSet.push(emptySet);          //add empty element
          matrixSet.push(emptySet);


          //Randing Set
          let matrixModel = new JSONModel({"Data": finalSet});
          th.getView().setModel(matrixModel, "matrix");
          predictPreferences(apiData, th,preferences);      //predict preferences
      }
      function computeResultSet(apiData,data) {         // find the data mapped in cells
          let record;
          let dx, dy;
          let accCategory = [],
              arrayOfCategories = [],
              len = data.length,
              resultSet = [];

          for (record = 0; record < len; record++) {        // compute results

              [dx, dy] = computeBMU(matrix, data[record]);
              if (!resultSet[dx + "|" + dy]) {
                  resultSet[dx + "|" + dy] = {};
                  resultSet[dx + "|" + dy]["news"] = [];
                  resultSet[dx + "|" + dy]["categories"] = apiData[record]["categories"];
              }
              resultSet[dx + "|" + dy]["news"].push(apiData[record]);
              resultSet[dx + "|" + dy]["x"] = dx + gOffset;
              resultSet[dx + "|" + dy]["y"] = dy + gOffset;
              resultSet[dx + "|" + dy]["dimension"] = 10;
              accCategory = JSON.parse(JSON.stringify(resultSet[dx + "|" + dy]["categories"].split("|")));
              arrayOfCategories = accCategory.concat(apiData[record]["categories"].split("|").filter(function (item) {
                  return accCategory.indexOf(item) < 0;
              }));
              resultSet[dx + "|" + dy]["cList"] = arrayOfCategories;
              resultSet[dx + "|" + dy]["categories"] = arrayOfCategories.join("|");
          }
          return resultSet;
      }

      function extractEncoding(apiData) {
          let oneHotCategory = oneHotEncoding(apiData, categoryList, 'categories', "|");
          let data = oneHotCategory.map(entity => {
              let list = JSON.parse(JSON.stringify(Array()));
              let category = entity["cList"];
              for (let index in category) {
                  list.push(category[index]);
              }
              return list;
          });
          return data;
      }


    function computeBMU(matrix,record) {        // find the wining cell based on distance
        let minimumDistance = 1000;
        let dx,dy;
        let distance = 0;
        for(let i=0;i<matrix.length;i++){
            for(let j=0;j<matrix[i].length;j++){
                distance = matrix[i][j].getDistance(record);
                if(minimumDistance> distance){
                    minimumDistance = distance;
                    dx = i;
                    dy = j;
                }
            }
        }
        return [dx,dy];
    }

    function predictPreferences(apiData,th, preferences){       //predict the preferences based on matrix and preferences vector
        let cList = createGroup(apiData, 'categories', "|");
        // "=====Prediction======"
        let data = extractEncoding(apiData);
        let resultSet = computeResultSet(apiData,data)

        let ePreferences =[];
        let preferencesVector = JSON.parse(JSON.stringify(encodePreferences(preferences,categoryList)));
        let havePreferences = 0;
        for (let index in preferencesVector) {
            ePreferences.push(preferencesVector[index]);
            havePreferences+= preferencesVector[index];

        }

        let dx, dy, i, record;
        let preferredNews = [];
        if (havePreferences !==0 || havePreferences >= Object.keys(categoryList).length) {
            let predictedOrder = predict(matrix, ePreferences, width * height);

            for (i = 0; i < predictedOrder.length; i++) {
                dx = predictedOrder[i]["x"];
                dy = predictedOrder[i]["y"];

                if (resultSet[dx + "|" + dy]) {
                    for ( record in resultSet[dx + "|" + dy]["news"]) {
                        preferredNews.push(resultSet[dx + "|" + dy]["news"][record]);
                    }
                }
            }
        }
        else{
            preferredNews = apiData;
        }
        let newsModel = new JSONModel({"News": preferredNews});
        th.getView().setModel(newsModel, "preferred");
        th.byId("newsContainer").setBusy(false)
    }

    function predict(matrix,record, dimension) {
        let i, j, k;
        let distance = 0;
        let current;
        let occ = 0;
        let iter = 0;
        let predictionVector = [];
        for (i = 0; i < dimension; i++) {
            predictionVector.push({"x": 0, "y": 0, "distance": 1000})
        }
        for (i = 0; i < matrix.length; i++) {
            for (j = 0; j < matrix[i].length; j++) {
                distance = matrix[i][j].getDistance(record);
                current = {
                    "x": i,
                    "y": j,
                    "distance": distance
                };

                for (k = occ - 1; k > -1 && predictionVector[k]["distance"] > distance; k--) {
                    iter++;
                    predictionVector[k + 1] = predictionVector[k]
                }
                predictionVector[k + 1] = JSON.parse(JSON.stringify(current));
                occ++;
            }
        }
        return predictionVector;
    }

    function validate(){
        let pathEntry = jQuery.sap.getModulePath("sap.ui.Odata.webapp.model.data", "/data.json");
        let pathWords = jQuery.sap.getModulePath("sap.ui.Odata.webapp.model.data", "/words.json");
        let rEntry = fetch(pathEntry).then(function(response){return response.json()});
        let rWords = fetch(pathWords).then(function(response){return response.json()});
        Promise.all([rEntry,rWords]).then(function([jsonEntry, words]){
            // -----------------------------------Validate SOM Method-------------------------------------
            const width = 5,
                height = 5,
                numIteration = 20,
                initialLearningRate = 0.5;

            let data=[];
            for (let ent in jsonEntry) {
                let entry=JSON.parse(JSON.stringify(Array()));
                for (let ent2 in jsonEntry[ent]) {
                    entry.push(jsonEntry[ent][ent2])

                }
                data.push(entry)
            }

            let dataLength = words.length;
            let mapRadius = Math.max(width, height) / 2;
            let lambda = numIteration / Math.log(mapRadius);
            let len = data.length;

            let matrix = [];
            for (let i = 0; i < width; i++) {       //create the matrix
                matrix[i] = [];
                for (let j = 0; j < height; j++) {
                    matrix[i][j] = new Node(dataLength, i, j);
                }
            }

            let iteration,
                record,
                i, j,
                dx, dy,
                itWeight,
                neighbourRadius,
                learningRate,
                influence,
                widthSq,
                distanceToNode,
                oldWeight,
                shuffleDataset;

            for (iteration = 0; iteration < numIteration; iteration++) {      //training
                //iteration epochs
                shuffleDataset = shuffleArray(JSON.parse(JSON.stringify(data)));        // get random data from array
                for (record = 0; record < len; record++) {
                    [dx, dy] = computeBMU(matrix, shuffleDataset[record]);      // compute Bmu for the record
                    neighbourRadius = mapRadius * Math.exp(-iteration / lambda);        // change the parameters
                    learningRate = initialLearningRate * Math.exp(-iteration / numIteration);
                    distanceToNode = 0;
                    widthSq = 0;
                    influence = 0;
                    oldWeight = 0;
                    for (i = 0; i < width; i++) {       // go through the matrix to find neighbours
                        for (j = 0; j < height; j++) {
                            distanceToNode = (dx - i) * (dx - i) + (dy - j) * (dy - j);
                            widthSq = neighbourRadius * neighbourRadius;
                            if (distanceToNode < widthSq) {         // if neighbours
                                influence = Math.exp(-distanceToNode / (2 * widthSq));
                                for (itWeight = 0; itWeight < matrix[i][j].length; itWeight++) {
                                    oldWeight = matrix[i][j]["weights"][itWeight];
                                    matrix[i][j]["weights"][itWeight] = oldWeight + influence * learningRate * (shuffleDataset[record][itWeight] - oldWeight);      //update weights
                                }
                            }
                        }
                    }
                }
            }
            let matrixSet = [],
                resultSet = [],
                finalSet = [],
                colorSet = [];

            let emptySet = {
                x: 0,
                y: 0,
                categories: "",
            };
            for (i = 0; i < len; i++) {
                matrixSet.push(JSON.parse(JSON.stringify(emptySet)));
            }

            for (let i = 0; i < width; i++) {       //create the matrix
                colorSet[i] = [];
                for (let j = 0; j < height; j++) {
                    colorSet[i][j] = {}
                }
            }
            let entryWords ="";
            for (record = 0; record < len; record++) {        // compute results
                [dx, dy] = computeBMU(matrix, data[record]);
                matrixSet[record]["x"] = dx ;
                matrixSet[record]["y"] = dy ;
                let cWords =JSON.parse(JSON.stringify(Array()));

                 //for only one category
                if (!resultSet[dx + "|" + dy]) {
                    resultSet[dx + "|" + dy] = {};
                }
                resultSet[dx + "|" + dy]["x"] = dx ;
                resultSet[dx + "|" + dy]["y"] = dy ;

                for (let wd in data[record]) {
                    if (data[record][wd] !== 0) {
                        entryWords = entryWords +"|"+ words[wd]["FIELD2"];
                        cWords.push(words[wd]["FIELD2"])
                    }
                }
                resultSet[dx + "|" + dy]["categories"] = entryWords;
                resultSet[dx + "|" + dy]["cList"] = cWords;
                entryWords = JSON.parse(JSON.stringify(""))
                matrixSet[record]["categories"] = cWords;
            }
            for (let ent in resultSet) {
                finalSet.push(resultSet[ent])
            }

            finalSet.push(emptySet);
            matrixSet.push(emptySet);

            //-------------------------------SOM-----------------------------------
            download(JSON.stringify(matrixSet),"matrixSet.txt", "text/plain");
            download(JSON.stringify(finalSet),"finalSet.txt", "text/plain");
            // download files
            return [data, words];
         });

        function download(data, filename, type) {
            var file = new Blob([data], {type: type});
            if (window.navigator.msSaveOrOpenBlob) // IE10+
                window.navigator.msSaveOrOpenBlob(file, filename);
            else { // Others
                let a = document.createElement("a"),
                    url = URL.createObjectURL(file);
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(function() {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 0);
            }
        }
    }

    let selectedIds="";
    let gModel;
    let th;
    let initialDialog;
    let promiseCalls=[];
    return MainController.extend("sap.ui.Odata.webapp.controller.Som", {
        onInit: function() {
            //todo online learning
            gModel = sap.ui.getCore().getModel();
            th=this;
            this.byId("newsContainer").setBusy(true)
            this.setProperties();
            // validate();

            this.considerPersonalContent();
        },

        // initNewsModel: function(){
        //     th.moreData();
        //     $.ajax({
        //         type: 'GET',
        //         url: "https://min-api.cryptocompare.com/data/v2/news/?lang=EN",
        //         async: false
        //     }).done(function(resp) {
        //         som(resp.Data,th, selectedIds);
        //     })
        //         .fail(function() {
        //             sap.m.MessageToast.show("Internet error!");
        //         });
        // },
        initNewsModel: function(){
            let news;
            let noNews=  sap.ui.getCore().getModel("settings").getData().NoNews;
            let serverDate = (new Date().getTime() ).toString().substr(0,10);
            for (let i=0; i<noNews; i++) {
                news = fetch("https://min-api.cryptocompare.com/data/v2/news/?lang=EN&lTs=" + serverDate).then(function (response) {return response.json()});
                serverDate = serverDate - 21600;
                promiseCalls.push(news);
            }
            Promise.all(promiseCalls).then(function(resp) {
                let data=[];
                resp.forEach( item => {
                        for (let elem= 0; elem<item.Data.length; elem++){
                            if (!th.contains(data,item.Data[elem] )){
                                data.push(item.Data[elem])
                            }
                        }
                    }
                );

                som(data,th, selectedIds);
            });
            this.openInitialPopUp();

        },

        openInitialPopUp: function(){
            let dialogCookie =  MainController.prototype.getCookie.apply(this,["newsDialog"]);
            console.log(dialogCookie);
            if(dialogCookie!=="done") {
                initialDialog = sap.ui.xmlfragment("sap.ui.Odata.webapp.fragment.NewsIntro", this);
                this.getView().addDependent(initialDialog);
                initialDialog.open();
                initialDialog.attachAfterClose(th.onClose);
                initialDialog.setTitle("Welcome to our News Section");
            }
        },

        onClose: function(oEvent) {		// destroy the Dialog
              document.cookie =  "newsDialog=done;";
              initialDialog.destroy()
        },
        contains: function(base, element ){
            for (let b in base ){
                if (base[b].id === element.id){
                    return true
                }
            }
            return false
        },

        initCategories: function (){
            gModel.read("/PreferencesSet",
                {
                    success: function (response) {
                        selectedIds = response.results[0]["Preference"];
                        // th.initNewsModel();
                        let categories = selectedIds.split("|");
                        categories.forEach( item => {th.byId("preferences").setSelectedItem(th.byId(item), true)})
                    }, error: function (oError) {
                    }
                });

        },
        onRecentSelect: function() {
            $.ajax({
                type: 'GET',
                url: "https://min-api.cryptocompare.com/data/v2/news/?lang=EN",
                async: false
            }).done(function(resp) {
                let oModel = new JSONModel({"News": resp.Data});

                th.getView().setModel(oModel, "preferred");

            })
                .fail(function() {
                    sap.m.MessageToast.show("Can't access remote resources!");
                });
        },

        formatJSONDate: function(date,pattern){
            arguments[0] = date;
            arguments[1] = pattern;
            return MainController.prototype.formatJSONDate.apply(this,arguments);
        },
        onOriginalPostPage: function(data) {
            window.open(data, "_blank");
        },
        considerPersonalContent: function(){
            let considerWalletContent= sap.ui.getCore().getModel("settings").getData().ConWalletContent;
            let considerWlistContent=  sap.ui.getCore().getModel("settings").getData().ConWlistContent;
            let initDBCategories= sap.ui.getCore().getModel("settings").getData().MemNewsCategories;
            if (!(initDBCategories || considerWalletContent || considerWlistContent ) ){
                th.initNewsModel();
                return;
            }
            gModel.setUseBatch(true);
            gModel.attachBatchRequestCompleted(this.batchEnd);
            if (initDBCategories) {
                this.initCategories();
            }
            if(considerWalletContent){
                this.appendSpecificContent("/WalletSet")
            }
            if(considerWlistContent){
                this.appendSpecificContent("/WatchlistSet")
            }
            // gModel.attachRequestCompleted( function () {         //when a request is finished
            //     console.log(selectedIds)
            // })
        },
        batchEnd: function(){           // called when the batch call end
            gModel.setUseBatch(false);
            th.initNewsModel();
        },


        appendSpecificContent: function(set){
            let categoryTable = this.byId("preferences");
            gModel.read(set,
                {   success: function(response){
                        response.results.forEach( item => categoryTable.setSelectedItem(th.byId(item.Currency.toLowerCase()), ));
                        selectedIds = categoryTable.getSelectedItems().map( item => {return item.getId().split("-").pop().toLowerCase()}).join("|");
                    }, error: function(e){},
                });
        },


        onCategorySelection: function () {
            this.byId("saveCategory").setEnabled(true);
        },
        onSave(){
            let initDBCategories= sap.ui.getCore().getModel("settings").getData().MemNewsCategories;
            let mParams = {
                context : null,
                success : function(oData, response) {
                },
                error : function(oError) {
                    MessageToast.show("Failed to save");
                },
                refreshAfterChange: true,
                async : true
            };
            selectedIds = this.byId("preferences").getSelectedItems().map( item => {return item.getId().split("-").pop().toLowerCase()}).join("|");
            if (initDBCategories) {
                gModel.create("/PreferencesSet", {UserId: "", Preference: selectedIds}, mParams);
            }
            this.recalculatePreferences();

        },
        recalculatePreferences: function(){
            let noNews=  sap.ui.getCore().getModel("settings").getData().NoNews;
            if (noNews === "1"){
                $.ajax({
                    type: 'GET',
                    url: "https://min-api.cryptocompare.com/data/v2/news/?lang=EN",
                    // url: "https://min-api.cryptocompare.com/data/v2/news/?categories=BTC",
                    async: false
                }).done(function(resp) {
                    predictPreferences(resp.Data,th, selectedIds);

                })
                    .fail(function() {
                        sap.m.MessageToast.show("Unknown error!");
                    });
            }else {
                Promise.all(promiseCalls).then(function(resp) {
                    let data=[];

                    resp.forEach( item => {
                            for (let elem= 0; elem<item.Data.length; elem++){
                                if (!th.contains(data,item.Data[elem] )){
                                    data.push(item.Data[elem])
                                }
                            }
                        }
                    );
                    predictPreferences(data,th, selectedIds);
                    console.log(data)
                })
            }
        },




        onCategoryShow: function(){
            this.byId("categories").setVisible(!this.byId("categories").getVisible());
        },
        setProperties: function () {
            let oVizFrame = this.getView().byId("idVizFrame");

            Format.numericFormatter(ChartFormatter.getInstance());
            let formatPattern = ChartFormatter.DefaultPattern;
            oVizFrame.setVizProperties({
                plotArea: {
                    dataLabel: {
                        formatString: formatPattern.SHORTFLOAT_MFD2,
                        visible: true,
                        hideWhenOverlap: false,
                        type: "color",
                        respectShapeWidth: false
                    },
                    drawingEffect: "normal", //glossy,

                },
                general:{
                    background:{
                        color: "white"
                    },
                    groupData: true
                },
                valueAxis: {
                    label: {
                        formatString: formatPattern.SHORTFLOAT
                    },
                    title: {
                        visible: false
                    },
                    visible: false
                },
                valueAxis2: {
                    label: {
                        formatString: formatPattern.SHORTFLOAT
                    },
                    title: {
                        visible: false
                    },
                    visible: false

                },
                categoryAxis: {
                    title: {
                        visible: false
                    }
                },
                sizeLegend: {
                    visible: false
                },
                title: {
                    visible: true,
                    text: 'News Map'
                }
            });
            let oPopOver = this.getView().byId("idPopOver");

            oPopOver.connect(oVizFrame.getVizUid());
            oPopOver.setFormatString(formatPattern.STANDARDFLOAT);
        },
    });
});
