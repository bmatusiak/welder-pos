"use strict";

module.exports = function(options, imports, register) {
    
    var main = imports.main;
    
    function renderSetupApp(req,res,error){
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        main.ejs.renderFile(__dirname + "/setup.html",{error:error,req:req,settings:main.settings},function(err,data){
            res.end(data);
        });
    }
    
    imports.main.welder.addRequestParser(function(http){
        
        http.app.get('/setup',main.Form.get(__dirname + "/setup.html",function(){
                    return !main.settings.isSetup;
                }));
        /* 
        http.app.get('/setup', function(req, res, next) {
            if(main.settings.isSetup) next(); else
            renderSetupApp(req,res);
        });
        */
        http.app.post('/setup',  main.Form.post(__dirname + "/setup.html",'/setup',{
            "appSetupUser": {//req.body.formid
                allow: function(){
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
            },
            "appSetupPOS":{
                allow: function(){
                    return !main.settings.isSetup;
                },
                next : function(req,res,error,callback){//next is required in this object
                    if(!error){
                        main.settings.set("isSetup","true",function(){
                            callback(null,"/");
                        });
                    }else 
                        callback();
                    
                }
            }
        }));
        /*
        http.app.post('/setup', function(req, res, next) {
            if(main.settings.isSetup) next(); else{
                if(req.body.formid == "appSetupUser"){
                    if(req.body.username && req.body.userlogin &&  req.body.password && req.body.password2 && req.body.password == req.body.password2 ){
                        imports.posEmployees.addEmployee(req.body.username,req.body.userlogin,req.body.password,null,function(err){
                            if(!err){
                                req.session.user = req.body.userlogin;
                                
                                main.settings.set("isUsersSetup","true",function(){
                                    res.writeHead(200, {
                                        'Content-Type': 'text/html'
                                    });
                                    main.ejs.renderFile(main.dir.template + "/redirect.html",{req:req,redirect:{path:"/setup"}},function(err,data){
                                        res.end(data);
                                    });
                                });
                            }else renderSetupApp(req,res,err.toString());
                        });
                    }else{
                        var errorString = "";
                        if(!req.body.username)
                            errorString +="User Name Must be Defined<br />";
                        
                        if(!req.body.userlogin)
                            errorString +="User Login Must be Defined<br />";
                        
                        if(req.body.password != req.body.password2)
                            errorString +="Password Must Match<br />";
                            
                        renderSetupApp(req,res,errorString);    
                    }
                }
                if(req.body.formid == "appSetupPOS"){
                    main.settings.set("isSetup","true",function(){
                        res.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
                        main.ejs.renderFile(main.dir.template + "/redirect.html",{req:req,redirect:{path:"/"}},function(err,data){
                            res.end(data);
                        });
                    });
                }
            }
        });
        */
    });
    
    register(null, {
        "appSetup": {}
    });
};
