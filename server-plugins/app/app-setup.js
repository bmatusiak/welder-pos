"use strict";
var fs = require("fs");

module.exports = function(pluginName,pluginDir,init){
    
return function(options, imports, register) {
    
    var pluginObject = {
        app:imports.app
    };
    var registerObject = {};
    registerObject[pluginName] = pluginObject;
    
    var Architect = require("architect");
    
    if(!options.plugins){
        options.plugins = [];
        var dirList = fs.readdirSync(pluginDir);
        for(var i = 0; dirList.length >= i;i++){
            if(dirList[i]){
                if(options.pluginOptions && options.pluginOptions[dirList[i]]){
                    options.pluginOptions[dirList[i]].packagePath = pluginDir+"/"+dirList[i];
                    options.plugins.push(options.pluginOptions[dirList[i]]);
                }else{
                    options.plugins.push(pluginDir+"/"+dirList[i]);
                }
            }
        }
        //console.log(options.plugins);
    }
    
    var ArchitectConfig = Architect.resolveConfig(options.plugins, pluginDir);
    
    ArchitectConfig.push({
        packagePath:__dirname,
        consumes:["hub"],
        provides:[pluginName],
        setup:function($options, $imports, $register){
            $imports.hub.on("service", function(name, plugin) {
                if(!plugin.name)plugin.name = name;
                
                registerObject[pluginName][plugin.name] = plugin;
                //console.log("Service loaded " + name);
            });
            $imports.hub.on("ready", function(app) {
                var plugins = app.services;
                init(registerObject[pluginName], plugins);
            });
            $register(null, registerObject);
        }
    });

    Architect.createApp(ArchitectConfig, function(err, architect) {
        if (err) {
            console.log(err);
            register(err);
        }else{
            console.log(pluginName,"Loaded!");
            register(null, registerObject);
        }
    });
};

};