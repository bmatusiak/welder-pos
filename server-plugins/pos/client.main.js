window.requirejs.config({
    baseUrl: '/static/modules',
    paths: {
        socketio: '/socket.io/socket.io'
    }
});
window.requirejs(["require","socketio"],function(r,socketio){
    if(socketio){
        console.log("socket.io loaded!");
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
            for (var i = 0; i < connectedFns.length; i++) {  
                connectedFns[i].call({},socket);
            }
        });
        
        $socket.on('disconnect', function () {
            socket.connected = false;
        });
        socket(function(){
            console.log("websocket connected");
        });   
    }
    window.loadMod = function(module,callback){
        console.log("Loading Module",module);
        var $ = window.$ || function(fn){ fn() };
        $(function(){
            require([module+"/"+module],callback);    
        });
    };
   //console.log("requirejs loaded");
   $.holdReady( false );
   $(function(){
       $("autoload").each(function(){
           var mod = $(this).attr("mod");
           var modData = $(this).attr("modData");
           window.loadMod(mod,function(fn){
               fn(modData);
           });
       });
   });
});
