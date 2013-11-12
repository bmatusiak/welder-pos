"use strict";

module.exports = function(options, imports, register) {
    
    var Form = {};
    
    Form.get = function(path,$formObject){
        var formObject = {};
        
        if(typeof($formObject) != "object"){
            formObject.next = function(req,res,cb){cb();};
            formObject.allow = typeof($formObject) == "function" ? $formObject : function(req,res,cb){cb();};
        }else 
            formObject = $formObject;
        
        return function(req,res,next){
            
            if(formObject.allow)
                formObject.allow(req,res,function(err,allow,templateData){ 
                    if(err && allow)
                        return res.redirect(allow || req.url);
                    
                    if(!err && allow === false)
                        return next();
                        
                    afterAllow(templateData);
                });
            else afterAllow();
            
            function afterAllow(extraData){
                var templateData = extraData || {};
            
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
    
    Form.post = function(path,$formObject){
        var formObject = {};
        
        if(typeof($formObject) != "object"){
            formObject.next = function(req,res,err,cb){cb();};
            formObject.allow = typeof($formObject) == "function" ? $formObject : function(req,res,cb){cb();};
        }else 
            formObject = $formObject;
            
        return function(req,res,next){
            
            if(formObject[req.body.formid]){
                var formID = formObject[req.body.formid];
                processObject(formID);
            }else if(formObject.next){
                processObject(formObject);
            }
        
            function processObject(formID){
                
                if(formID.allow)
                    formID.allow(req,res,function(err,allow){
                        if(err && allow)
                            return res.redirect(allow || req.url);
                        
                        if(!err && allow === false)
                            return next();
                            
                        afterAllow();
                    });
                else afterAllow();
                
                function afterAllow(){
                    if(formID.required){
                        formID.required(req,res,function(err,required){
                            Form.condition(required, afterRequired);
                        });
                    } else afterRequired();
                }
                
                function afterRequired(badCondition,errorString){
                    formID.next(req,res,(badCondition ? errorString : null ),function(err,successPath){
                        if(err || badCondition){
                            var error = errorString+(err ? err +"<br />" : '');
                            req.ejs(path,{error:error});
                        }
                        else {
                            res.redirect(successPath || req.url);
                        }
                    });
                }
            }
        };
    };
    
    register(null, {
        "Form": Form
    });

};
