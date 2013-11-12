"use strict";

module.exports = function(options, imports, register) {
    
    var app = imports.app;
    
    function renderSetupApp(req,res,error){
        req.ejs(__dirname + "/setup.html",{error:error,settings:app.settings});
    }
    
    app.welder.addRequestParser(function(http){
        
        http.get('/setup',app.Form.get(__dirname + "/setup.html",function allow(req,res,callback){
            if(app.settings.isUsersSetup && !req.session.user){
                if(!app.settings.isSetup)
                    callback("app is not setup and user is not logged in so redirect to /login ","/login");
                else callback("app is setup so redirect to / ","/");
            }else 
                callback(!app.settings.isUsersSetup || !app.settings.isSetup && req.session.user);
        }));
        
        http.post('/setup',  app.Form.post(__dirname + "/setup.html",{
            "appSetupUser": {//req.body.formid
                allow: function(req,res,next){
                    next(null,!app.settings.isSetup);
                },
                required : function(req,res,next){
                    next(null,[
                        [req.body.username,"User Name Must be Defined"],
                        [req.body.password,"Password Must be Defined"],
                        [req.body.password2,"Password Confirm Must be Defined"],
                        [req.body.password == req.body.password2,"Password & Password Confirm Must Match"],
                    ]);
                },
                next : function(req,res,error,callback){//next is required in this object
                    if(!error)
                        app.users.addUser(req.body.username,req.body.userlogin,req.body.password,null,function(err){
                            if(!err){
                                req.session.user = req.body.userlogin;
                                
                                app.settings.set("isUsersSetup","true",function(){
                                    callback();
                                });
                            }else callback(err);
                        });
                    else callback();
                }
            },
            "appSetupPOS":{
                allow: function(req,res,next){
                    next(null,!app.settings.isSetup && req.session.user);
                },
                next : function(req,res,error,callback){//next is required in this object
                    if(!error){
                        app.settings.set("isSetup","true",function(){
                            callback(null,"/");
                        });
                    }else 
                        callback();
                    
                }
            }
        }));
    });
    
    register(null, {
        "setup": {}
    });
};
