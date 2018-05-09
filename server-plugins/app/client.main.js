(function(){
    window.requirejs.config({
    baseUrl: '/static/modules',
        paths: {
            socketio: '/socket.io/socket.io'
        }
    });
    window.requirejs(["require","socketio"],function(r,socketio){
        if(socketio){
            //console.log("socket.io loaded!");
            var $socket = socketio.connect();
            
            var connectedFns = [];
            var socket = window.socket =  function(fn){
                connectedFns.push(fn);
                if(socket.connected === true)
                    fn.call({},socket);
            };
            
            socket.on = function(){
                $socket.on.apply($socket,arguments);
            };
            
            socket.emit = function(){
                $socket.emit.apply($socket,arguments);
            };
            socket.connected = false;
            
            $socket.on('connect', function () {
                socket.connected = true;
                $(function(){
                    for (var i = 0; i < connectedFns.length; i++) {  
                        connectedFns[i].call({},socket);
                    }
                });
            });
            
            $socket.on('disconnect', function () {
                //console.log("websocket disconnected");
                socket.connected = false;
                socket.ready = false;
                $.holdReady( true );
            });
            
            $socket.on('socket-ready', function () {
                //console.log("websocket ready");
                socket.ready = true;
                $.holdReady( false );
            });
            
            socket(function(){
                //console.log("websocket connected");
            });   
        }
        var loadMod = function(module,moduleFile,callback){
            //var $ = window.$ || function(fn){ fn() };
            //$(function(){
                
            //console.log("Loading Module",module);
            require([module+"/"+moduleFile],callback);    
            //});
        };
       //console.log("requirejs loaded");
   
       $("autoload").each(function(){
           var mod = $(this).attr("mod");
           var modFile = $(this).attr("modFile");
           if(!modFile) modFile = mod;
           var modData = $(this).attr("modData") || $(this).data();
           loadMod(mod,modFile,function(fn){
               fn.call(new EventEmitter(),modData);
           });
       });
    });
    
    var EventEmitter = function() {};
    EventEmitter.prototype = {
        on: function(event, fct) {
            this._events = this._events || {};
            this._events[event] = this._events[event] || [];
            this._events[event].push(fct);
        },
        off: function(event, fct) {
            this._events = this._events || {};
            if (event in this._events === false) return;
            this._events[event].splice(this._events[event].indexOf(fct), 1);
        },
        emit: function(event /* , args... */ ) {
            this._events = this._events || {};
            if (event in this._events === false) return;
            for (var i = 0; i < this._events[event].length; i++) {
                this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
            }
        }
    };
})();