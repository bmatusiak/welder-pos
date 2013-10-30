"use strict";
var fs = require("fs");

module.exports = function(options, imports, register) {
    
    var POS = {
        app:imports.app
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
        provides:["pos"],
        setup:function($options, $imports, $register){
            $imports.hub.on("service", function(name, plugin) {
                if(!plugin.name)plugin.name = name;
                
                POS[plugin.name] = plugin;
                //console.log("Service loaded " + name);
            });
            $imports.hub.on("ready", function(app) {
                var plugins = app.services;
                for(var i in plugins){
                    if(plugins[i].moduleDir){
                        POS.app.welder.addStatic("/static/modules/"+i,plugins[i].moduleDir,false);
                    }
                    if(plugins[i].httpConnection){
                        POS.app.welder.addRequestParser(plugins[i].httpConnection);
                    }
                    if(plugins[i].socketConnection){
                        POS.app.sockets.addSocketConnection(plugins[i].socketConnection);
                    }
                }
            });
            $register(null, {
                "pos": POS
            });
        }
    });

    Architect.createApp(ArchitectConfig, function(err, architect) {
        if (err) {
            console.log(err);
            register(err);
        }else{
            console.log("POS Plugins Loaded!");
            register(null, {
                "pos": POS
            });
        }
    });
};
