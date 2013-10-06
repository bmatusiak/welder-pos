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
    
    
    var http =  {
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