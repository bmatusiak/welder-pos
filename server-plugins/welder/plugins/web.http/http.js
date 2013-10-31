"use strict";

module.exports = function(options, imports, register) {
    
    var express = require('express');
    
    var app = express();
    
    var server = require('http').createServer(app);
    
    var PORT_CHECK = process.env.PORT || null;
    var IP_CHECK = process.env.IP || null;
    
    
    if(!IP_CHECK){
        IP_CHECK = "0.0.0.0";
    }
    
    var dummy = function(a,b,c){
        c();
    };
    
    var useFirst = [];
    function attach($app,arr){
        for(var i = 0;arr.length >= i;i++)
            if(arr[i])
                $app.use.apply($app,arr[i]);
    }
    function argsToArr(Args){
        var args = [];
        for(var i = 0;Args.length >= i;i++)
            if(Args[i])
                args.push(Args[i]);
        return args;
    }
    
    var sub = function(){
        var middleware = [];
        var midArgs = argsToArr(arguments);
        
        for(var i = 0;midArgs.length >= i;i++)
            if(midArgs[i])
                middleware.push([midArgs[i]]);
        
        return {
            use:function(){
                var args = argsToArr(arguments);
                
                if(args.length)
                    middleware.push(args);
            },
            get:function(){ 
                var args = argsToArr(arguments);
                                    
                app.use(function(req,res,next){
                    
                    var $app = express();
                    
                    attach($app,useFirst);
                    
                    attach($app,middleware);
                        
                    $app.get.apply($app,args);
                    
                    $app(req,res,next);
                });
            },
            post:function(){
                var args = argsToArr(arguments);
                                    
                app.use(function(req,res,next){
                    
                    var $app = express();
                    
                    attach($app,useFirst);
                    
                    attach($app,middleware);
                        
                    $app.post.apply($app,args);
                    
                    $app(req,res,next);
                });
            }
        };
    };
    
    var http =  {
            sub:sub,
            use:function(){
                var args = argsToArr(arguments);
                
                if(args.length)
                    useFirst.push(args);
            },
            get:function(){ 
                var args = argsToArr(arguments);
                                    
                app.use(function(req,res,next){
                    
                    var $app = express();
                    
                    attach($app,useFirst);
                        
                    $app.get.apply($app,args);
                    
                    $app(req,res,next);
                });
            },
            post:function(){
                var args = argsToArr(arguments);
                                    
                app.use(function(req,res,next){
                    
                    var $app = express();
                    
                    attach($app,useFirst);
                        
                    $app.post.apply($app,args);
                    
                    $app(req,res,next);
                });
            },
            app:app,
            server:server,
            express:express,
            listen: function(port,ip,callback){
                if(!PORT_CHECK){
                    require("./netutil.js").findFreePort(5000, 10000, "localhost", function(err,$port){
                        PORT_CHECK = $port;
                        doNext();
                    });
                }else doNext();
                
                function doNext(){
                    var PORT = port || PORT_CHECK;
                    var IP = ip || IP_CHECK;
                    server.listen(PORT, IP,function(err){
                        if(!err){
                            console.log("Server Listen Started",IP+":"+PORT);
                        }
                        if(callback)
                        callback(err,server);
                    });
                }
            }
        };
    
    
    
    if(!PORT_CHECK){
        require("./netutil.js").findFreePort(5000, 10000, "localhost", function(err,port){
            PORT_CHECK = port;
        });
    }
    if(register)
        register(null, {
            "http":http
        });
    else
    return http;
};