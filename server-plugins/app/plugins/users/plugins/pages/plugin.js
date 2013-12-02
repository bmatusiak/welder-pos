"use strict";

var fs = require("fs");

module.exports = function(options, imports, register) {
    
    var pages = {};
    
    var list = fs.readdirSync(__dirname);
    
    for(var i in list){
        var file = list[i];
        if(file.indexOf(".html") >= 1){
            pages[file.replace(".html","")] = __dirname+"/"+file;
        }
    }
    
    register(null, {
        "pages": pages
    });

};
