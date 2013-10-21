"use strict";

module.exports = function(options, imports, register) {
    
    var main = imports.main;
    
    register(null, {
        "appEmailer": {
            send:function(to,subject,body,atachment){
                
            }
        }
    });

};
