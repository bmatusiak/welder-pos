var Architect = require("architect");

var configPath = __dirname+"/config.js";

require(configPath)(function(plugins){
    var app = Architect.createApp(Architect.resolveConfig(plugins, __dirname + "/server-plugins"), function(err, architect) {
        if (err) {
            console.error("While compiling app config '%s':", configPath);
            console.log(err);
            throw err;
        }else{
            var welder = architect.services.welder;
            welder.architect = architect;
            welder.start(function(err){
                if(err){
                    console.error("While Starting app '%s'", err);
                }else{
                    console.log("Started App!");
                }
            });
        }
    });
    app.on("service", function(name, plugin) {
        if (!plugin.name)
            plugin.name = name;
            
        console.log("Service loaded " + name);
    });
});