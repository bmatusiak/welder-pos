"use strict";

module.exports = function(options, imports, register) {
    
    var fs = require("fs");
    
    var APP = {
        plugin:require("./app-setup.js"),
        db:imports["db-mongoose"],
        welder:imports.welder,
        hub:imports.hub,
        dir:{
            template: __dirname+"/template"
        }
    };
    
    var Architect = require("architect");
    
    if(!options.plugins){
        options.plugins = [];
        var dirList = fs.readdirSync(__dirname + "/plugins");
        for(var i = 0; dirList.length >= i;i++){
            if(dirList[i]){
                if(options.pluginOptions && options.pluginOptions[dirList[i]]){
                    options.pluginOptions[dirList[i]].packagePath = __dirname + "/plugins/"+dirList[i];
                    options.plugins.push(options.pluginOptions[dirList[i]]);
                }else{
                    options.plugins.push(__dirname + "/plugins/"+dirList[i]);
                }
            }
        }
        //console.log(options.plugins);
    }
    
    var ArchitectConfig = Architect.resolveConfig(options.plugins, __dirname + "/plugins");
    
    ArchitectConfig.push({
        packagePath:__dirname,
        consumes:["hub"],
        provides:["app"],
        setup:function($options, $imports, $register){
            
            var appServices = [];
            
            $imports.hub.on("service", function(name, plugin) {
                if(!plugin.name)plugin.name = name;
                
                APP[plugin.name] = plugin;
                appServices.push(name);
            });
            
            $imports.hub.on("ready", function() {
                console.log("App Services:",appServices);
                
                require("./main.js")(APP);
                
                register(null, {
                    "app": APP
                });
            });
            
            //register internal app
            $register(null, {
                "app": APP
            });
        }
    });
    
    Architect.createApp(ArchitectConfig, function(err, architect) {
        if (err) {
            console.log(err);
            register(err);
        }else{
            console.log("APP Plugins Loaded!");
        }
    });
};
