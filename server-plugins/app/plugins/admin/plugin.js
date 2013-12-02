"use strict";

module.exports = function(options, imports, register) {
    var plugin,app = imports.app;
    
    var adminPlugins = {};
    var adminPluginsPost = {};
    
    app.welder.addRequestParser(function(http){
        var adminOnly = http.sub(app.users.checkUserAuth(null,"admin"));
        adminOnly.get("/admin/:plugin?/:action?",function(req,res,next){
            if(!req.params.plugin) req.params.plugin = "index";
            
            if(adminPlugins[req.params.plugin])
                adminPlugins[req.params.plugin](req,res,next);
            else req.ejs(app.dir.template+"/error.html",{error:"Page '"+req.url+"' Not Found"});
        });
        
        adminOnly.post("/admin/:plugin?/:action?",function(req,res,next){
            if(!req.params.plugin) req.params.plugin = "index";
            if(!req.params.action) req.params.action = false;
            
            if(adminPluginsPost[req.params.plugin])
                adminPluginsPost[req.params.plugin](req,res,next);
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
            register:function(pluginName,middlewareFN,middlewareFNPost){
                if(!adminPlugins[pluginName])
                adminPlugins[pluginName] = middlewareFN;
                
                if(!adminPluginsPost[pluginName])
                adminPluginsPost[pluginName] = middlewareFNPost;
                
            },
            httpAdmin:function(callback){
                if(callback)
                    callback(app.http.sub(app.users.checkUserAuth(null,"admin")));
            }
        }
    });
    
    
    plugin.register("index",function(req,res,next){
        req.ejs(__dirname + "/pages/index.html",{admin_plugins:adminPlugins});
    });
};
                    