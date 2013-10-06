"use strict";

module.exports = function(options, imports, register) {
    
    var ejs = imports.ejs;
    
    var main = {
        welder:imports.welder,
        dir:{
            template: __dirname+"/template"
        }
    };
    
    imports.welder.addRequestParser(function(http){
        http.app.get('/', function(req, res, next) {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            ejs.renderFile(main.dir.template + "/page.html",function(err,data){
                res.end(data);
            });
        });
        
    });
    
    imports.welder.addStatic("/",__dirname+"/static",false);
    
    register(null, {
        "main": main
    });

};
