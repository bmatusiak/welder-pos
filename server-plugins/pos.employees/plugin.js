"use strict";

module.exports = function(options, imports, register) {
    
    var db = require("./db.employees.js")(imports["db-mongoose"]);
    
    //db.newEmployee(name,login,password,whoCreatedLogin,callback)
    //db.getEmployee(login,callback)
    //db.listEmployees(callback)
    
    imports.main.welder.addMiddleWare(function(http){
        http.app.use(function(req,res,next){
            if(req.session.user)
                req.user = req.session.user;
                
            next();
        });
        http.app.use("/logout",function(req,res,next){
            delete req.session.user;
                
            res.redirect("/");
        });
        http.app.post("/login",function(req,res,next){
            if(!req.body.userlogin || !req.body.password) 
                res.redirect("/");
            else
            db.getEmployee(req.body.userlogin,function(err,employee){
                
                if(!err && req.body.password == employee.userpass)
                    req.session.user = req.body.userlogin;
                
                res.redirect("/");
            });
        });
    });
    
    register(null, {
        "posEmployees": {
            addEmployee:function(name,login,password,whoCreatedLogin,callback){
                db.newEmployee(name,login,password,whoCreatedLogin,function(err){
                    callback(err);
                });
            },
            listEmployees:db.listEmployees,
            changeEmployee:function(login,newData,callback){
                db.getEmployee(login,function(err,emp){
                    
                });
            },
            removeEmployee:function(){
                
            }
        }
    });

};
