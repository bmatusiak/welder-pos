"use strict";

module.exports = function(options, imports, register) {
    
    var app = imports.app;
    
    app.plugin("ecommerce",__dirname+"/plugins",function(ecommerce,plugins){
        
    })(options, imports, register);
    
};