"use strict";

module.exports = function(options, imports, register) {
    
    var app = imports.app;
    
    app.plugin("pos",__dirname+"/plugins",function(pos,plugins){
        delete pos.pos;
        app.ejs.staticOption("pos",pos);
        pos.elements = {};
        for(var i in plugins){
            if(plugins[i].elementsDir){
                pos.elements[i] = {};
                app.ejs.use(plugins[i].elementsDir,pos.elements[i]);
            }
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
            if(plugins[i].settings && plugins.settings && plugins[i] !== pos){
                for(var j in plugins[i].settings){
                    var name = j;
                    var desc = plugins[i].settings[j][1];
                    var val = plugins[i].settings[j][0];
                    plugins.settings.define(i,name,desc,val);
                }
            }
        }
    })(options, imports, register);
    
};