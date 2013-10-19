"use strict";

module.exports = function(options, imports, register) {
    var connectUtil = require('express/node_modules/connect/lib/utils.js');
    var Events = require('events');
    var EventEmitter = Events.EventEmitter;
    var socketIO = new EventEmitter();
    socketIO.io = io;
    
    var http = imports.http;
    var io = require('socket.io').listen(http.server);
    var store =  imports.session.store;
    
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
            data.sessionID = connectUtil.parseSignedCookie(data.signedCookies[imports.session.cookieID] || data.cookies[imports.session.cookieID], imports.session.secret);
            store.load(data.sessionID, function(err, session) {
                if (err || !session) return accept('Error: No Session Found', true);
                
                data.session = session;
                return accept(null, true);
            });
        });
        
    });
    
    
    io.sockets.on('connection', function(socket) {
        var $socket = {};
        
        $socket.session = socket.handshake.session;
        
        $socket.emit = function(){//server -->> client
            socket.emit.apply(socket,arguments);
            $socket.session.touch().save();
        };
        
        $socket.on = function(){//server <<-- client
            var overload = function(fn){
                return function(){
                    $socket.session.touch().save();
                    fn.apply({},arguments);
                };
            };
            for(var i in arguments){
                if(typeof(arguments[i]) == "function")
                    arguments[i] = overload(arguments[i]);
            }
            socket.on.apply(socket,arguments);
        };
        
        $socket.session.touch().save();
        
        socketIO.emit("connection",$socket);
        
        $socket.on("test",function(){
            console.log($socket.session,arguments);
        });
    });
    
    
    
    if(register)
        register(null, {
            "socketio":socketIO
        });
    else
        return io;
};

