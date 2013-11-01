var express = require("express");

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

module.exports = function (app,useFirst){
    
    if(!useFirst) 
        useFirst = [];
    
    return function(){
        var middleware = [];
        var midArgs = argsToArr(arguments);
        
        for(var i = 0;midArgs.length >= i;i++)
            if(midArgs[i])
                middleware.push([midArgs[i]]);
        
        var sub = {
            sub:function(){
                var $app = express();
                    
                var newSub = module.exports($app,middleware);
                
                app.use(function(req,res,next){
                    attach($app,useFirst);
                
                    $app(req,res,next);
                });
                return newSub.apply(newSub,arguments);
            },
            use:function(){
                var args = argsToArr(arguments);
                
                if(args.length)
                    middleware.push(args);
                    
                return sub;
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
                return sub;
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
                return sub;
            }
        };
        return sub;
    };
}