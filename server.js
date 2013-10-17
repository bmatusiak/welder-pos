var Architect = require("architect");

var configPath = __dirname+"/config.js";
var app;

require(configPath)(function(plugins){
    app = Architect.createApp(Architect.resolveConfig(plugins, __dirname + "/server-plugins"), function(err, architect) {
        if (err) {
            console.error("While compiling app config '%s':", configPath);
            console.log(err);
            throw err;
        }else{
            console.log("App Loaded!");
        }
    });
    
    app.services.hub.on("service", function(name, plugin) {
        var app = this;
        if (!plugin.name)
            plugin.name = name;
            
        console.log("Service loaded " + name);
    });
    
});