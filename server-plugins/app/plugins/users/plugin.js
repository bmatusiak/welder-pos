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
        
        http.get("/user/:id",plugin.checkUserAuth(),
        app.Form.get(__dirname + "/user.html",function(req,res,callback){
            db.getUser(req.params.id,function(err,user){
                req.data = {id:req.params.id,user:user};
                callback(null,null,{permissions:permissions});
            });
            return true;
        }));
        
        http.post("/user/:id",plugin.checkUserAuth(),
        app.Form.post(__dirname + "/user.html",{//req.body.formid
                allow: function(req,res,callback){
                    callback();
                },
                required : function(req,res,next){
                    next(null,[
                        [req.params.id,"UserID Must be Defined"],
                        [req.body.password && 
                            req.body.password2 && 
                            req.body.password == req.body.password2 || true,
                            "Password & Password Confirm Must Match"],
                    ]);
                },
                next : function(req,res,error,callback){//next is required in this object
                    if(!error)
                        db.getUser(req.params.id,function(err,user){
                            if(err) return callback(err);
                            
                            if(req.body.password && req.body.password2)
                                user.userpass = req.body.password;
                                
                            var userPerm = user.permissions;
                            for (var i in permissions) {
                                if(req.body["permission_"+i]){
                                    userPerm[i] = true;
                                }else{ 
                                    userPerm[i] = false;
                                }
                            }
                            user.permissions = userPerm;
                            user.save(function(err){
                                callback(err);
                            });
                        });
                    else callback();
                }
            }));
        
        http.use("/logout",function(req,res,next){
            delete req.session.user;
                
            res.redirect("/");
        });
        
        http.get("/login",app.Form.get(__dirname + "/login.html",function(req,res,callback){
            callback(req.session.user || !app.settings.isUsersSetup && req.session.user, "/");
        }));
            
        http.post("/login",app.Form.post(__dirname + "/login.html",{
                allow: function(req,res,next){
                    next(null,true);
                },
                required : function(req,res,next){
                    next(null,[
                        [req.body.userlogin,"UserLogin Must be Defined"],
                        [req.body.password,"Password Must be Defined"],
                    ]);
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
                                        callback(null,req.query.path);
                                    }else 
                                        callback(errStr);
                                });
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
                            res.redirect("/login?path="+req.url);
                        }else{
                            if(permission)
                                if(req.user.permissions[permission])
                                    next();
                                else req.ejs(app.dir.template + "/restricted.html");
                            else    
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
                    