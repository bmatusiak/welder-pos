"use strict";

module.exports = function(options, imports, register) {
    
    var app = imports.app;
    
    app.plugin("pluginApp",__dirname+"/plugins",function(pluginApp,plugins){
        
    })(options, imports, register);
    
};