"use strict";

module.exports = function(options, imports, register) {
    
    var APP = imports;
    
    APP.dir = {
            template: __dirname+"/template"
        };
        
    APP.plugin = require("./app-setup.js");
    
    APP.plugin("app",__dirname + "/plugins",function(plugin,plugins){
        
        require("./main.js")(APP);
        
    },APP)(options, imports, register);
};
