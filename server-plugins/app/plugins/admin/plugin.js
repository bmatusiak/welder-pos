"use strict";

module.exports = function(options, imports, register) {
    var plugin,app = imports.app;
    
    var adminPlugins = {};
    
    app.welder.addRequestParser(function(http){
        http.get("/admin/:plugin?",function(req,res,next){
            if(!req.params.plugin) req.params.plugin = "index";
            
            if(adminPlugins[req.params.plugin])
                adminPlugins[req.params.plugin](req,res,next);
            else req.ejs(app.dir.template+"/error.html",{error:"Page '"+req.url+"' Not Found"});
        });
    });
    
    register(null,{
        "admin":plugin = {
            init:function(){
                app.menus.
                register("USERDROPDOWN",{
                    link:"/admin",
                    title:"Admin",
                    sort:100000,
                    permission:"admin"
                });
                
            },
            register:function(pluginName,middlewareFN){
                if(!adminPlugins[pluginName])
                adminPlugins[pluginName] = middlewareFN;
            }
        }
    });
    plugin.register("index",function(req,res,next){
        req.ejs(__dirname + "/pages/index.html")
    });
};
                    