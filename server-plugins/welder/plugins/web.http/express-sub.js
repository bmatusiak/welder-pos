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
    
    return function(){
        
        var sub = {
            app: $app,
            
            sub:function(){
                
                var newSub = module.exports(sub)();
                
                return newSub.use.apply(newSub,arguments);
            },
            use:function(){
                var midArgs = argsToArr(arguments);
                
                if(typeof midArgs[0] == "object")
                    attach($app,midArgs[0]);
                else
                    $app.use.apply($app,midArgs);
                
                return sub;
            },
            get:function(){ 
                var midArgs = argsToArr(arguments);
                
                $app.get.apply($app,midArgs);
                
                return sub;
            },
            post:function(){
                $app.post.apply($app,argsToArr(arguments));
                
                return sub;
            }
        };
        return sub;
    };
}