"use strict";

module.exports = function(options, imports, register) {
    
    var app = imports.app;
    
    app.plugin("users",__dirname+"/plugins",function(users){
        
        users.init = function(){
            
            users.permissions.register("admin",false,"Allow Admin Actions");
                
            users.permissions.register("add_users",false,"Allow Adding new Users");
            
            users.permissions.register("set_user_permissions",false,"Allow Settings User Permissions");
            
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
            
            app.admin.
            register("Users",function(req,res,next){
                users.db.listUsers({},req.query.page,50,function(err,$users){
                    req.ejs(users.pages.users,{users:$users})  ;  
                });
            });
            
        };
        users.addUser = function(name,login,password,email,whoCreatedLogin,callback){
            users.db.newUser(name,login,password,email,whoCreatedLogin,function(err,user){
                if(!err && app.emailer.enabled){
                    app.emailer.sendTemplate(
                        app.emailer.templates+"/user_welcome.html",
                        user.useremail,
                        user
                    );
                }
                callback(err);
            });
        };
        users.checkUserAuth = function(type,permission){
            if(type == "http" || !type){
                return function(req,res,next){
                    if(!req.session.user) {
                        res.redirect("/login?path="+req.url);
                    }else{
                        if(permission)
                            if(req.user.permissions[permission])
                                next();
                            else {
                                req.ejs(app.dir.template+"/restricted.html");
                            }
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
            
        };
        
        for(var i in users){
            if(users[i] === users) continue;
            
            if(users[i] && users[i].init) users[i].init();
        }
    })(options, imports, register);
    
/*
    register(null,{
        "users":plugin = {
            init:function(){
                
            },
            
            
            
        }
    });
    
*/
};