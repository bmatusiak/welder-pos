"use strict";

module.exports = function(options, imports, register) {
    
    var main = imports.main;
    
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
        http.app.get("/login",main.Form.get(__dirname + "/login.html"));
            
        http.app.post("/login",main.Form.post(__dirname + "/login.html",'/',{
                required : function(req,res){
                    return [
                        [req.body.userlogin,"UserLogin Must be Defined"],
                        [req.body.password,"Password Must be Defined"],
                    ];
                },
                next : function(req,res,error,callback){
                    if(!error)
                        db.getEmployee(req.body.userlogin,function(err,employee){
                            if(!err){
                                main.Form.condition([
                                    [employee.userpass ,"Account Has No Password"],
                                    [req.body.password == employee.userpass,"Incorrect Password"]
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
                
            },
            checkEmployeeAuth:function(req,res,next){
                if(!req.session.user) {
                    res.redirect("/");
                }else{
                    next();
                }
            }
        }
    });

};
