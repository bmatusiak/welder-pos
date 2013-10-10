"use strict";

module.exports = function(options, imports, register) {
    
    var Form = {};
    Form.get = function(path,allow){//url path "/submit/form"
        return function(req,res,next){
            if(typeof(allow) == "function" && !allow(req,res))
                return next();
                    
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            imports.ejs.renderFile(path,{error:'',req:req},function(err,data){
                res.end(data);
            });
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
                if(typeof(formID.allow) == "function" && !formID.allow(req,res))
                    return next();
                    
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
                        res.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
                        imports.ejs.renderFile(path,{error:error,req:req},function(err,data){
                            res.end(data);
                        });
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
