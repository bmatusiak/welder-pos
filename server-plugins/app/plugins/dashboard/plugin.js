"use strict";

module.exports = function(options, imports, register) {
    
    var app = imports.app;
    
    app.welder.addRequestParser(function(http){
        var scope = http.sub(app.users.checkUserAuth());
        
        scope.get('/home', function(req, res, next) {
            req.ejs(__dirname + "/dashboard.html");
        });
    });
    
    register(null, {
        "dashboard": {
            init:function(){
                app.menus.
                register("SUBNAV",{
                    icon:"icon-home",
                    link:"/",
                    title:"Home",
                    sort:0
                });
            },
            register:function(){
                
            }
        }
    });

};
