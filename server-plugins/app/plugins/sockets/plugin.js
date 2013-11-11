"use strict";

module.exports = function(options, imports, register) {
    
    var app = imports.app;
    
    var connectUtil = require('express/node_modules/connect/lib/utils.js');
    var Events = require('events');
    var EventEmitter = Events.EventEmitter;
    var $socketIO = new EventEmitter();
    $socketIO.io = io;
    
    var http = app.welder.http;
    var io = require('socket.io').listen(http.server);
    var session = imports.session;
    //var store =  imports.session.store;
    
    if(options.useRedis){
        var redis = require('socket.io/node_modules/redis');
        var RedisStore = require('socket.io/lib/stores/redis');
    
        var pub = redis.createClient(options.redisPort, options.redisHost);
        var sub =  redis.createClient(options.redisPort, options.redisHost);
        var Client =  redis.createClient(options.redisPort, options.redisHost);
        
        if(options.redisAuth){
            pub.auth(options.redisAuth);
            sub.auth(options.redisAuth);
            Client.auth(options.redisAuth);
        }
    }
    
    io.configure(function() {
        io.set("transports", ["xhr-polling"]);
        io.set("polling duration", 10);
        io.set("log level", 0);
        if(options.useRedis){
            io.set('store', new RedisStore({
                redisPub: pub,
                redisSub: sub,
                redisClient: Client
            }));
        }
    });
    
    
    io.set('authorization', function(data, accept) {
        http.cookieHandler(data,null,function(){
            data.sessionID = connectUtil.parseSignedCookie(data.signedCookies[session.cookieID] || data.cookies[session.cookieID], session.secret);
            session.store.load(data.sessionID, function(err, $session) {
                if (err || !$session) return accept('Error: No Session Found', true);
                
                data.session = $session;
                return accept(null, true);
            });
        });
        
    });
    
    function AppSocket(__socket){
        var _self = this;
        this.session = __socket.handshake.session;
        
        this.emit = function(){//server -->> client
            __socket.emit.apply(__socket,arguments);
            _self.session.touch().save();
        };
        
        this.on = function(){//server <<-- client
            var overload = function(fn){
                return function(){
                    _self.session.touch().save();
                    fn.apply({},arguments);
                };
            };
            for(var i in arguments){
                if(typeof(arguments[i]) == "function")
                    arguments[i] = overload(arguments[i]);
            }
            __socket.on.apply(__socket,arguments);
        };
        
        this.session.touch().save();
    }
    
    io.sockets.on('connection', function(__socket) {
        var $socket = new AppSocket(__socket);
        
        $socketIO.emit("connect",$socket);
        
    });
    
    var appSocketFunctions = [];
    var appSocketUserFunctions = [];
    
    $socketIO.on("connect",function(_$socket){
        for (var i=0;i<appSocketFunctions.length;i++){ 
            appSocketFunctions[i](_$socket);
        }
        app.users.checkUserAuth("socket")(_$socket,function(isUser){
            if(isUser){
                for (var j=0;j<appSocketUserFunctions.length;j++){ 
                    appSocketUserFunctions[j](_$socket);
                }
                _$socket.emit("socket-ready");
            }else _$socket.emit("socket-ready");
            
        });
        
    });
    
    register(null, {
        "sockets": {
            addSocketConnection:function(fn){
                appSocketFunctions.push(fn);
            },
            addSocketUserConnection:function(fn){
                appSocketUserFunctions.push(fn);
            }
        }
    });
    
    

};
