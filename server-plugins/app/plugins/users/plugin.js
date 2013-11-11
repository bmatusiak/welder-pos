"use strict";

module.exports = function(options, imports, register) {
    var app = imports.app;
    var db = require("./db.users.js")(app.db);
    
    //db.newUser(name,login,password,whoCreatedLogin,callback)
    //db.getUser(login,callback)
    //db.listUsers(callback)
    //db.auth(req.body.userlogin,req.body.password,function(err, user, reason){
    
    var plugin;
    var permissions = {
        /*
        name:{
            description:description,
            value:default
        }
        */
    };
    
    app.welder.addMiddleWare(function(http){
        
        
        http.use(function(req,res,next){
            if(req.session.user && !req.user){
                db.getUser(req.session.user,function(err,user){
                    if(!err && user)
                    req.user = user; 
                    next();
                });
            } else
                next();
        });
        
        http.get("/user",function(req,res,next){
            res.redirect("/user/"+req.session.user);
        });
        
        http.get("/user/:id",[plugin.checkUserAuth(),function(req,res,next){
            db.getUser(req.params.id,function(err,user){
                req.data = {id:req.params.id,user:user};
                next();
            });
        }],app.Form.get(__dirname + "/user.html",function(req,res,callback){
            callback({permissions:permissions});
            return true;
        }));
        
        http.post("/user/:id",[plugin.checkUserAuth(),function(req,res,next){
            db.getUser(req.params.id,function(err,user){
                req.data = {id:req.params.id,user:user};
                next();
            });
        }],app.Form.get(__dirname + "/user.html",function(req,res,callback){
            callback({permissions:permissions});
            return true;
        }));
        
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
                        db.auth(req.body.userlogin,req.body.password,function(err, user, reason){
                            if(!err){
                                app.Form.condition([
                                    [user,"Failed to Login!"]
                                ],function(err,errStr){
                                    if(!err){
                                        req.session.user = user.userlogin;
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
        "users":plugin = {
            init:function(){
                app.menus.
                register("USERDROPDOWN",{
                    link:"/logout",
                    title:"Logout",
                    sort:100000
                });
                
                app.menus.
                register("USERDROPDOWN",{
                    link:"/user",
                    title:"My Account",
                    sort:10000
                });
            },
            registerPermission:function(name,def,description){
                permissions[name] = {description:description,value:def};
            },
            addUser:function(name,login,password,whoCreatedLogin,callback){
                db.newUser(name,login,password,whoCreatedLogin,function(err){
                    callback(err);
                });
            },
            listUsers:db.listUsers,
            checkUserAuth:function(type,permission){
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
    plugin.registerPermission("admin",false,"Allow Admin Actions");
};
                    