"use strict";

module.exports = function(options, imports, register) {
    
    var main = {
        welder:imports.welder,
        ejs:imports.ejs,
        Form:imports.Form,
        settings:imports.settings,
        dir:{
            template: __dirname+"/template"
        }
    };
    
    main.ejs.use(main.dir.template + "/parts");
    main.ejs.staticOption("main",main);
    
    imports.welder.addRequestParser(function(http){
        
        http.app.use('/index.html', function(req, res, next) {
            res.redirect("/");
        });
        http.app.get('/', function(req, res, next) {
            if(!req.session.user){
                if(main.settings.isUsersSetup){
                    res.redirect("/login");
                }else{
                    res.redirect("/setup");
                }
            }else{
                if(!main.settings.isSetup){ 
                    res.redirect("/setup");
                }else{
                    res.redirect("/dashboard");
                }
            }
        });
        
    });
    
    imports.welder.addStatic("/",__dirname+"/static",false);
    
    register(null, {
        "main": main
    });

};
