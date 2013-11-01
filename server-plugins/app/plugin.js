"use strict";

module.exports = function(options, imports, register) {
    
    imports.dir = {
        template: __dirname+"/template"
    };
    imports.plugin = require("./app-setup.js");
    imports.plugin("app",__dirname + "/plugins",function(plugin,plugins){
        
        require("./main.js")(imports);
        
    })(options, imports, register);
};
