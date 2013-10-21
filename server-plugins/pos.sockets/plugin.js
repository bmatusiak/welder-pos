"use strict";

module.exports = function(options, imports, register) {
    
    var posSocketFunctions = [];
    
    imports.socketio.on("connection",function(socket){
        for (var i=0;i<posSocketFunctions.length;i++){ 
            posSocketFunctions[i](socket);
        }
    });
    
    register(null, {
        "posSockets": {
            addSocketConnection:function(fn){
                posSocketFunctions.push(fn);
            }
        }
    });
    
    

};
