sap.ui.define([
        "sap/ui/Odata/webapp/controller/MainController",
        "sap/m/MessageToast",
        "sap/ui/model/json/JSONModel",

    ],
    function(MainController,MessageToast,JSONModel) {
        "use strict";
        let th;
        let mParams;
        let gModel;
        return MainController.extend("sap.ui.Odata.webapp.controller.Forum",
            {
                onInit : function() {
                    th=this;
                    gModel=sap.ui.getCore().getModel();
                    mParams = {
                        context : null,
                        success : function(oData, response) {
                            MessageToast.show(oData.Text);
                        },
                        error : function(oError) {
                            MessageToast.show("Failed to post the comment");
                        },
                        refreshAfterChange: true,
                        async : true
                    };

                    this.initForumDiscussion();
                },
                initForumDiscussion: function(){        // init the posting list
                    gModel.read("/ForumSet",
                        {
                            success: function (response) {
                                let i,year,month,day, time,replyIndex,forumEntry,forumModel, id,len;
                                let forumSet = [];
                                len = response.results.length;
                                for ( i = 0; i < response.results.length; i++) {        // iterate to show in the list
                                    forumSet.push({
                                        Id: 0,
                                        Name: "",
                                        Text: "",
                                        Date: "",
                                        ReplyEntry: false,
                                        ReplyTo: 0,
                                        NoReply: 0
                                    });
                                }
                                for ( i=0; i<len;i++){          // create teh model
                                    id = response.results[i].Id-1;
                                    if(forumSet[id]===undefined){
                                        continue;
                                    }
                                    forumSet[id].Id = id+1;
                                    forumSet[id].Name = response.results[i].Name;
                                    forumSet[id].Text = response.results[i].Text;
                                    forumSet[id].Topic = response.results[i].Topic;
                                    year = response.results[i].PostDate.getFullYear();
                                    month = response.results[i].PostDate.getMonth()+1;
                                    day = response.results[i].PostDate.getDate();
                                    arguments[0] =response.results[i].Time.ms;
                                    time = 	MainController.prototype.msToTime.apply(this,arguments);		// call the method to transform ms to time from Main Controller
                                    month = month<10?'0'+month:month;
                                    day = day<10?'0'+day:day;
                                    forumSet[id].Date = year+'.'+month+'.'+day+ ' ' + time;
                                }
                                for ( i=0; i<len;i++){
                                    id = response.results[i].Id-1;
                                    if(forumSet[id]===undefined){
                                        continue;
                                    }
                                    replyIndex = response.results[i].ReplyTo;
                                    if(replyIndex>0){           //if it is reply to someone
                                        forumSet[replyIndex-1].NoReply ++;
                                        forumSet[id].ReplyName =
                                            forumSet[replyIndex-1].Name;
                                        forumSet[id].ReplyTo =replyIndex-1;
                                        forumSet[id].ReplyText =
                                            forumSet[replyIndex-1].Text;
                                        forumSet[id].ReplyEntry = true;
                                    }else{
                                        forumSet[id].ReplyEntry = false;
                                    }
                                }
                                forumEntry = {};
                                forumEntry.data = forumSet;
                                forumModel= new JSONModel(forumEntry);
                                th.getView().setModel(forumModel,"forumDiscussion")         // set the model to the page
                            }, error: function (e) {

                            },
                            async:true
                        }
                    );
                },
                addComment: function () {           // post a comment
                    let thModel = th.getView().getModel();
                    let newComment = {};
                    newComment.Name = this.byId("nickname").getValue();
                    newComment.Text = this.byId("comment").getValue();
                    newComment.Topic = '';
                    newComment.ReplyTo = 0;
                    if (newComment.Name ==='' || newComment.Text===''){
                        MessageToast.show("Empty fields");
                        return;
                    }
                    if (newComment.Name.length > 19 || newComment.Text >999){
                        MessageToast.show("Name or Comment to long");
                        return;
                    }
                    thModel.create("/ForumSet", newComment, mParams);
                    MessageToast.show("Posting...",{duration:1000});
                    this.initForumDiscussion()
                    this.byId("nickname").setValue("");
                    this.byId("comment").setValue("");
                },
                addReplyOn: function (oEvent,id) {          // add a reply
                    console.log(id);
                    let replyComment ={};
                    let replyBox= oEvent.getSource().getParent().getParent();
                    replyComment.Name = replyBox.getContent()[0].getValue();
                    replyComment.Text = replyBox.getContent()[1].getValue();
                    if (replyComment.Name.length > 19 || replyComment.Text >999){
                        MessageToast.show("Name or Comment to long");
                        return;
                    }
                    replyComment.ReplyTo= id;
                    replyComment.Topic='';
                    replyBox.close();
                    gModel.create("/ForumSet", replyComment, mParams);
                    this.initForumDiscussion()
                },

            });
    });
