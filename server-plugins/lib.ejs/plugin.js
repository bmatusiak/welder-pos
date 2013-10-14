"use strict";

module.exports = function(options, imports, register) {
    
    var fs = require("fs");
    var ejs = require("ejs");
    
    function EJSfile() {}
    
    EJSfile.prototype.renderFile = function(filename, options, callback) {
        var _self = this;
        if (!callback) {
            callback = options;
            options = this.options();
        }
        else {
            this.options(options);
        }
        fs.readFile(filename, function(fserr, data) {
            if(fserr) throw fserr;
            try {
                _self.render(data.toString(), options, callback);
            }
            catch (err) {
                var e = new ReferenceError(err.toString().replace("ReferenceError: ejs:", filename + ":"));
                console.log(err,filename);
                throw e;
            }
    
        });
    };
    
    EJSfile.prototype.render = function(str, options, callback) {
        if (!callback) {
            callback = options;
            options = this.options();
        }
        else {
            this.options(options);
        }
    
        try {
            callback(null,ejsRender(str, options));
        }
        catch (err) {
            
            throw err;
        }
    
    };
    
    EJSfile.prototype.options = function(options) {
        if (!options) options = {};
    
        for (var i in this.elements)
        options[i] = this.elements[i];
        
        for (var j in this._staticOptions)
        options[j] = this._staticOptions[j];
    
        return options;
    };
    
    EJSfile.prototype._staticOptions = {};
    
    EJSfile.prototype.staticOption = function(name,option) {
        if(option)
            this._staticOptions[name] = option;
        
        return this._staticOptions[name];
    };
    
    
    EJSfile.prototype.elements = {};
    
    EJSfile.prototype.use = function(elementsDir) {
    
        var theEleFunction = function(str, filename) {
            return function() {
                var oldArgs;
                if(this.args)
                    oldArgs = this.args;
                
                this.args = arguments;
                
                try {
                    var data = ejsRender(str, this);
                    delete this.args;
                    if(oldArgs)
                        this.args = oldArgs;
                        
                    return data;
                }
                catch (err) {
                    var e = new ReferenceError(err.toString().replace("ReferenceError: ejs:", filename + ":"));
                    throw e;
                }
            };
        };
        var files = fs.readdirSync(elementsDir);
    
        for (var i in files) {
            this.elements[files[i].replace(".html", "")] = theEleFunction(fs.readFileSync(elementsDir + "/" + files[i]).toString(), elementsDir + "/" + files[i]);
            //console.log("ejs:",files[i].replace(".html", "")+"()",files[i]);
        }
    };
    
    function ejsRender() {
        return ejs.render.apply(ejs, arguments);
    }
    
    register(null, {
        "ejs": new EJSfile()
    });
};