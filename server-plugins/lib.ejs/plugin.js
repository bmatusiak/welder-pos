"use strict";

module.exports = function(options, imports, register) {
    
    var fs = require("fs");
    
    var ejs = require("ejs");
    
    ejs.renderFile = function(filename,options,callback){
        if(!callback) callback = options;
        fs.readFile(filename, function(err, data) {
            callback(err,ejs.render(data.toString(),options));
        });
    };
    
    register(null, {
        "ejs": ejs
    });

};
