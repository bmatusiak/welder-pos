"use strict";

module.exports = function(options, imports, register) {
    
    var app = imports.app;
    
    app.plugin("pos",__dirname+"/plugins",function(pos,plugins){
        for(var i in plugins){
            if(plugins[i].moduleDir){
                app.welder.addStatic("/static/modules/"+i,plugins[i].moduleDir,false);
            }
            if(plugins[i].httpConnection){
                app.welder.addRequestParser(plugins[i].httpConnection);
            }
            if(plugins[i].socketConnection){
                app.sockets.addSocketConnection(plugins[i].socketConnection);
            }
            if(plugins[i].socketUserConnection){
                app.sockets.addSocketUserConnection(plugins[i].socketUserConnection);
            }
        }
    })(options, imports, register);
    
};