"use strict";

module.exports = function(app) {
    app.welder.addStaticFile("/static/modules/main.js",__dirname+"/client.main.js",false);

    app.welder.addStatic("/",__dirname+"/static",false);
    
    app.ejs.use(app.dir.template + "/parts");
    app.ejs.staticOption("app",app);
    
    app.welder.addRequestParser(function(http){
        http.use('/index.html', function(req, res, next) {
            res.redirect("/");
        });
        http.get('/', function(req, res, next) {
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
};