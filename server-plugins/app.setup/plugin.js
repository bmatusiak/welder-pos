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
        
        http.app.get('/setup', function(req, res, next) {
            if(main.settings.isSetup) res.redirect("/"); else
            renderSetupApp(req,res);
        });
        
        http.app.post('/setup', function(req, res, next) {
            if(req.body.formid == "appSetupUser"){
                if(req.body.username && req.body.userlogin &&  req.body.password && req.body.password2 && req.body.password == req.body.password2 ){
                    imports.posEmployees.addEmployee(req.body.username,req.body.userlogin,req.body.password,null,function(err){
                        if(!err){
                            req.session.user = req.body.userlogin;
                            
                            main.settings.set("isUsersSetup","true",function(){
                                res.writeHead(200, {
                                    'Content-Type': 'text/html'
                                });
                                main.ejs.renderFile(main.dir.template + "/redirect.html",{redirect:{path:"/setup"}},function(err,data){
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
                    main.ejs.renderFile(main.dir.template + "/redirect.html",{redirect:{path:"/"}},function(err,data){
                        res.end(data);
                    });
                });
            }
        });
        
    });
    
    register(null, {
        "appSetup": {}
    });
};
