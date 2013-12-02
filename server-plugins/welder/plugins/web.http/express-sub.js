var express = require("express");

function attach($app,arr){
    for(var i = 0;arr.length >= i;i++)
        if(arr[i])
            $app.use.apply($app,arr[i]);
}

function argsToArr(Args){
    var args = [];
    for(var i = 0;Args.length >= i;i++)
        if(Args[i]){
            args.push(Args[i]);
        }
    return args;
}

module.exports = function (app){
    
    var $app = express();
    
    var userage = app.app || app;
    userage.use($app);
    
    return function(middlewares){
        if(!middlewares) middlewares = [];
        
        var sub = {
            app: $app,
            
            sub:function(){
                var mw = [];
                
                var Args = argsToArr(arguments);
                
                for(var i = 0;Args.length >= i;i++)
                    if(Args[i]){
                        mw.push(Args[i]);
                    }
                    
                return module.exports(sub)(mw);
            },
            use:function(){
                var Args = argsToArr(arguments);
                
                $app.use.apply($app,Args);
                
                return sub;
            },
            get:function(A,B,C){ 
                if(C)
                    $app.get.call($app,A,[].concat(middlewares,B),C);
                else 
                    $app.get.call($app,A,middlewares,B);
                    
                return sub;
            },
            post:function(A,B,C){
                if(C)
                    $app.post.call($app,A,[].concat(middlewares,B),C);
                else 
                    $app.post.call($app,A,middlewares,B);
                  
                return sub;
            }
        };
        return sub;
    };
}