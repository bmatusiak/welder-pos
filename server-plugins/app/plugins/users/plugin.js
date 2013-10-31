"use strict";

module.exports = function(options, imports, register) {
    var app = imports.app;
    var db = require("./db.users.js")(app.db);
    
    //db.newUser(name,login,password,whoCreatedLogin,callback)
    //db.getUser(login,callback)
    //db.listUsers(callback)
    
    app.welder.addMiddleWare(function(http){
        http.use(function(req,res,next){
            if(req.session.user)
                req.user = req.session.user;
                
            next();
        });
        
        http.use("/logout",function(req,res,next){
            delete req.session.user;
                
            res.redirect("/");
        });
        http.get("/login",app.Form.get(__dirname + "/login.html",function(req,res,redirectTo){
            redirectTo("/");
            return app.settings.isUsersSetup && !req.session.user;
        }));
            
        http.post("/login",app.Form.post(__dirname + "/login.html",'/',{
                required : function(req,res){
                    return [
                        [req.body.userlogin,"UserLogin Must be Defined"],
                        [req.body.password,"Password Must be Defined"],
                    ];
                },
                next : function(req,res,error,callback){
                    if(!error)
                        db.getUser(req.body.userlogin,function(err,user){
                            if(!err){
                                app.Form.condition([
                                    [user.userpass ,"Account Has No Password"],
                                    [req.body.password == user.userpass,"Incorrect Password"]
                                ],function(err,errStr){
                                    if(!err){
                                        req.session.user = req.body.userlogin;
                                        callback();
                                    }else 
                                        callback(errStr);
                                });
                                //req.session.user = req.body.userlogin;
                                //callback();
                            }else 
                                callback(err);
                        });
                    else callback();
                }
            })
        );
    });
    register(null,{
        "users":{
            addUser:function(name,login,password,whoCreatedLogin,callback){
                db.newUser(name,login,password,whoCreatedLogin,function(err){
                    callback(err);
                });
            },
            listUsers:db.listUsers,
            changeUser:function(login,newData,callback){
                db.getUser(login,function(err,user){
                    
                });
            },
            checkUserAuth:function(type){
                if(type == "http" || !type){
                    return function(req,res,next){
                        if(!req.session.user) {
                            res.redirect("/login");
                        }else{
                            next();
                        }
                    };
                }else if(type == "socket"){
                    return function(socket,next){
                        if(socket.session.user) {
                            next(true);// true if users valid
                        }else next();
                    };
                }
                
            }
        }
    });
};
                    