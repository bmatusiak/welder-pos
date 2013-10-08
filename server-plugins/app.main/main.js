"use strict";

module.exports = function(options, imports, register) {
    
    var main = {
        welder:imports.welder,
        ejs:imports.ejs,
        dir:{
            template: __dirname+"/template"
        }
    };
    
    imports.welder.addRequestParser(function(http){
        
        /*
        http.app.post('/login', function(req, res, next) {
            req.session.user = req.body.userlogin;
            res.redirect("/");
        });
        */
        http.app.use('/index.html', function(req, res, next) {
            res.redirect("/");
        });
        http.app.get('/', function(req, res, next) {
            if(!req.session.user){
                imports.welder.architect.services.appSetup.db.settings.getSetting("isUsersSetup",function(err,isUsersSetup){
                    if(isUsersSetup){
                        res.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
                        main.ejs.renderFile(main.dir.template + "/login.html",req,function(err,data){
                            res.end(data);
                        });
                    }else{
                        res.redirect("/setup");
                    }
                });
            }else{
                imports.welder.architect.services.appSetup.db.settings.getSetting("isSetup",function(err,isSetup){
                    if(!isSetup){ 
                        res.redirect("/setup");
                    }else{
                        res.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
                        main.ejs.renderFile(main.dir.template + "/page.html",{req:req},function(err,data){
                            res.end(data);
                        }); 
                    }
                });
            }
        });
        
    });
    
    imports.welder.addStatic("/",__dirname+"/static",false);
    
    register(null, {
        "main": main
    });

};
