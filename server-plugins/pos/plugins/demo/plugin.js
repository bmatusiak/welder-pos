"use strict";

module.exports = function(options, imports, register) {
    
    var pos = imports.pos;
    
    register(null, {
        "demo": {
            moduleDir:__dirname+"/static",
            httpConnection:function(http){
                
            },
            socketUserConnection:function($socket){
                
            }
        }
    });

};
