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
            $(function(){
                for (var i = 0; i < connectedFns.length; i++) {  
                    connectedFns[i].call({},socket);
                }
            });
        });
        
        $socket.on('disconnect', function () {
            console.log("websocket disconnected");
            socket.connected = false;
            socket.ready = false;
            $.holdReady( true );
        });
        
        $socket.on('socket-ready', function () {
            console.log("websocket ready");
            socket.ready = true;
            $.holdReady( false );
        });
        
        socket(function(){
            console.log("websocket connected");
        });   
    }
    var loadMod = function(module,callback){
        console.log("Loading Module",module);
        var $ = window.$ || function(fn){ fn() };
        $(function(){
            require([module+"/"+module],callback);    
        });
    };
   //console.log("requirejs loaded");
   $(function(){
       $("autoload").each(function(){
           var mod = $(this).attr("mod");
           var modData = $(this).attr("modData") || $(this).data();
           loadMod(mod,function(fn){
               fn(modData);
           });
       });
   });
});
