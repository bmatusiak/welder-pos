"use strict";

module.exports = function(options, imports, register) {
    
    var exports =  {
        welder:imports.welder
    };
    
    imports.welder.addRequestParser(function(http){
        http.app.get('/', function(req, res, next) {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            
            res.end("main.js /");
        });
        
    });
    
    imports.welder.addStatic("/static",__dirname+"/static",true);
    
    register(null, {
        "main": exports
    });

};
