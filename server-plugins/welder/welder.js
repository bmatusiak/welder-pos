"use strict";
module.exports = function(options, imports, register) {
    
    var welder;
    
    var http = imports.http = require("./plugins/web.http/http.js")();
    http.cookieHandler = http.express.cookieParser(options.clientSecret);
    //compress everything
    http.app.use(http.express.compress());
    
    var __StaticMountPaths = [];
    function _StaticFiles(){
        var Path,mount,name;
        for (name in __StaticMountPaths) {
            Path = __StaticMountPaths[name].toString();
            mount = name;
            addStaticMount(mount, Path,true);
        } 
    }
    
    function addStaticMount(mount, dir, listDirAlso){
        if(options.listDirectories || listDirAlso)
            http.app.use(mount, http.express.directory(dir));
        
        http.app.use(mount, http.express.static(dir));
        console.log("Static Mounted",mount,"=",dir);
    }
    
    var __RequestParsers = [];
    function _RequestParsers(){
        for (var i in __RequestParsers) {
            __RequestParsers[i](http);
        } 
        console.log("_RequestParsers done");
    }
    
    var __Middlewares = [];
    function _Middlewares(){
        http.app.use(http.express.bodyParser());
        http.app.use(http.cookieHandler);
        
        for(var i in __Middlewares){
            __Middlewares[i](http);
        }
        console.log("_Middlewares done");
    }
    
    function beforeListen(callback){
        _StaticFiles();
        _Middlewares();
        _RequestParsers();
        
        callback();
    }
    
    welder = {
        http:http,
        addStatic:function(mount,dir,listDirAlso){
            if(options.listDirectories || listDirAlso)
                http.app.use(mount, http.express.directory(dir));
            
            http.app.use(mount, http.express.static(dir));
            console.log("Static Mounted",mount,"=",dir);
        },
        addMiddleWare:function(fn){
            __Middlewares.push(fn);
        },
        addRequestParser:function(fn){
            __RequestParsers.push(fn);
        },
    };
    
    imports.hub.on("service", function(name, plugin) {
        if(!plugin.name)plugin.name = name;
        console.log("Service loaded " + name);
    });
    
    imports.hub.on("ready",function(app){
        welder.architect = app;
        beforeListen(http.listen);
    });
    
    register(null,{"welder": welder,"http":http});
    
};