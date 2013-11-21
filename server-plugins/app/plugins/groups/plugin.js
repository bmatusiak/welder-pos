"use strict";

module.exports = function(options, imports, register) {
    
    var app = imports.app;
    var db = require("./db.groups.js")(app.db);
    
    register(null, {
        "groups": {
            init:function(){
                app.admin.register("groups",function(req,res,next){
                    if(req.params.action){
                        app.users.getPermissions(function(err,permissions){
                            req.data = {permissions:permissions};
                            if(req.params.action !== "new"){
                                db.getGroup(req.params.action,function(err,group){
                                    req.data.group = group || {groupname:req.params.action};
                                    req.ejs(__dirname+"/pages/groups.html",{error:err});
                                });
                            }else{
                                req.data.group={};
                                req.ejs(__dirname+"/pages/groups.html");    
                            }
                        });
                    }else{
                        db.listGroups({},function(err,groups){
                            req.data = {groups:groups};
                            req.ejs(__dirname+"/pages/groups.html"); 
                        });
                    }
                },app.Form.post(__dirname+"/pages/groups.html",{
                    allow: function(req,res,next){
                        if(req.params.action){
                            app.users.getPermissions(function(err,permissions){
                                req.data = {permissions:permissions,group:{}};
                                next(null,true);     
                            });
                        }else{
                            req.data = {groups:{}};
                            next();
                        }
                        
                    },
                    required : function(req,res,next){
                        next(null,[
                            [req.body.groupname,"Group Name Must be Defined"],
                        ]);
                    },
                    next : function(req,res,error,next){
                        function addPermissions(group){
                            var userPerm = (group ? group.permissions : {});
                            for (var i in req.data.permissions) {
                                if(req.body["permission_"+i]){
                                    userPerm[i] = true;
                                }else{ 
                                    userPerm[i] = false;
                                }
                            }
                            return userPerm;
                        }
                        if(error) return next();
                        if(req.params.action){
                            if(req.params.action !== "new"){
                                db.getGroup(req.params.action,function(err,group){
                                    
                                    if(err || !group){
                                        req.data.group = {groupname:req.params.action};
                                        return next(err || "No Group exist");  
                                    } 
                                    req.data.group = group;
                                    group.permissions = addPermissions(group);
                                    group.save(function(err){
                                        next(err); 
                                    });
                                });
                            }else{
                                db.getGroup(req.body.groupname,function(err,group){
                                    if(err && !group){
                                        db.newGroup(req.body.groupname,addPermissions(),req.session.user,function(){
                                            next(null,"/admin/groups/"+req.body.groupname);
                                        });
                                    }else{
                                    req.data.group = group || {groupname:req.params.action};
                                        return next(err);     
                                    }
                                });
                            }
                        }else{
                            next();
                        }
                        
                    }
                }));
            }
        }
    });

};
