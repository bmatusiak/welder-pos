"use strict";

module.exports = function(options, imports, register) {
    
    var Form = {};
    Form.get = function(path,$formObject){//url path "/submit/form"
        var formObject = {};
        
        if(typeof($formObject) != "object"){
            formObject.next = function(req,res,cb){
                cb();
            };
            formObject.allow = $formObject || function(){return true;};
        }else 
            formObject = $formObject;
        /*
        var formObject = {
            allow: function(req,res){//next will not be called if false,instead will do http.next()
                return (req.session.user);
            },
            next : function(req,res,callback){//next is required in this object
                callback(err,{someData:'template data object'})
            }
        };
        */
        return function(req,res,next){
            
            var templateData = {error:req.body.error || ''};
            
            var doRedirect;
            if(typeof(formObject.allow) == "function" && !formObject.allow(req,res,function(redirectPath){
                if(typeof redirectPath == "string")
                    doRedirect = redirectPath;
                else 
                    for(var i in redirectPath){
                        templateData[i] = redirectPath[i];
                    }
            })){
                if(doRedirect) 
                    return res.redirect(doRedirect);
                return next();
            }
            
            
            if(formObject.next){
                formObject.next(req,res,function(err,data){
                    for(var i in data){
                        templateData[i] = data[i];
                    }
                    req.ejs(path,templateData);
                });
            }else{
                req.ejs(path,templateData);
            }
        };
    };
    Form.condition = function(condition,callback){
        var badCondition = false;
        var errorString = "";
        for (var i = 0; i < condition.length; i++) {
            if(!condition[i][0]){
                errorString +=condition[i][1]+"<br />";
                badCondition = true;
            }
        }
        callback(badCondition,errorString);
    };
    Form.post = function(path,redirectPath,formObject){//url path "/submit/form"
        /*
        var formObject = {
            "appSetupUser": {//req.body.formid
                allow: function(req,res){//next will not be called if false,instead will do http.next()
                    return !main.settings.isSetup;
                },
                required : function(req,res){
                    return [
                        [req.body.username,"User Name Must be Defined"],
                        [req.body.password,"Password Must be Defined"],
                        [req.body.password2,"Password Confirm Must be Defined"],
                        [req.body.password == req.body.password2,"Password & Password Confirm Must Match"],
                    ];
                },
                next : function(req,res,error,callback){//next is required in this object
                    if(!error)
                        imports.posEmployees.addEmployee(req.body.username,req.body.userlogin,req.body.password,null,function(err){
                            if(!err){
                                req.session.user = req.body.userlogin;
                                
                                main.settings.set("isUsersSetup","true",function(){
                                    callback();
                                });
                            }else callback(err);
                        });
                    else callback();
                }
            }
        };
        */
        return function(req,res,next){
            if(formObject[req.body.formid]){
                var formID = formObject[req.body.formid];
                processObject(formID);
            }else if(formObject.next){
                processObject(formObject);
            }
        
            function processObject(formID){
                var doRedirect;
                if(typeof(formID.allow) == "function" && !formID.allow(req,res,function(redirectPath){
                    doRedirect = redirectPath;
                })){
                    if(doRedirect) 
                        return res.redirect(doRedirect);
                    return next();
                }
                    
                var formCheckOut = true;
                var errorString = "";
                if(formID.required){
                    var required = formID.required(req,res);
                    for (var i = 0; i < required.length; i++) {
                        if(!required[i][0]){
                            errorString +=required[i][1]+"<br />";
                            formCheckOut = false;
                        }
                    }
                }
                
                formID.next(req,res,(!formCheckOut ? errorString : null ),function(err,rdPath){
                    if(err || !formCheckOut){
                        var error = errorString+(err ? err +"<br />" : '');
                        
                        req.ejs(path,{error:error});
                        
                    }
                    else res.redirect(rdPath || redirectPath);
                });
                
            }
        };
    };
    
    register(null, {
        "Form": Form
    });

};
