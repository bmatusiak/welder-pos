"use strict";

module.exports = function(app) {
    app.welder.addStaticFile("/static/modules/main.js",__dirname+"/client.main.js",false);

    app.ejs.use(app.dir.template + "/parts");
    app.ejs.staticOption("app",app);
    
    //update settigns per page request
    app.welder.addMiddleWare(function(http){
        http.app.use(function(req, res, next) {
            app.settings.load(function(){
                next();
            });
        });
    });
    
    app.welder.addRequestParser(function(http){
        
        http.app.use('/index.html', function(req, res, next) {
            res.redirect("/");
        });
        http.app.get('/', function(req, res, next) {
            if(!req.session.user){
                if(app.settings.isUsersSetup && app.settings.isSetup){
                    res.redirect("/home");
                }else{
                    res.redirect("/setup");
                }
            }else{
                if(!app.settings.isSetup){ 
                    res.redirect("/setup");
                }else{
                    res.redirect("/home");
                }
            }
        });
        
    });
    
    app.welder.addStatic("/",__dirname+"/static",false);
};
