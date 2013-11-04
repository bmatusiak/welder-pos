module.exports = function(options, imports, register) {
    
    var fs = require("fs");
    var ejs = require("ejs");
    
    function EJSfile() {
        this.staticOptions = {};
        this.elements = {};
    }
    
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
            options.filename = filename;
            if(fserr) throw fserr;
            try {
                _self.render(data.toString(), options, callback);
            }
            catch (err) {
                //var e = new ReferenceError(err.toString().replace("ReferenceError: ejs:", filename + ":"));
                console.log(err,filename);
                throw err;
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
        
        for (var j in this.staticOptions)
        options[j] = this.staticOptions[j];
    
        return options;
    };
    
    EJSfile.prototype.staticOption = function(name,option) {
        if(option)
            this.staticOptions[name] = option;
        
        return this.staticOptions[name];
    };
    function getOptions(args){
        if(args.callee.caller.caller.caller.caller === ejs.render){
            return args.callee.caller.caller.arguments[0];
        }
        return false;
    }
    EJSfile.prototype.use = function(elementsDir,returnObject) {
        var _self = this;
        var useElements = returnObject || _self.elements;
        var theEleFunction = function(str, filename) {
            return function() {
                //as long as this gets executed inside ejs its safe
                var options = getOptions(arguments) || _self.options();
                
                var oldArgs,oldFilename;
                if(options.args)
                    oldArgs = options.args;
                
                if(options.filename)
                    oldFilename = options.filename;
                
                options.args = arguments;
                options.filename = filename;
                try {
                    var data = ejsRender(str, options);
                    delete options.args;
                    if(oldArgs)
                        options.args = oldArgs;
                        
                    delete options.filename;
                    if(oldFilename)    
                        options.filename = oldFilename;
                        
                    return data;
                }
                catch (err) {
                    var e = new ReferenceError(err.toString().replace("ReferenceError: ejs:", filename + ":"));
                    throw e;
                }
            };
        };
        var files = fs.readdirSync(elementsDir);
        
        var setupElement = function(file){
            useElements[file.replace(".html", "")] = theEleFunction(fs.readFileSync(elementsDir + "/" + file).toString(), elementsDir + "/" + file);
            fs.watch(elementsDir + "/" + file, function(event) {
                if(event == "change"){
                    useElements[file.replace(".html", "")] = theEleFunction(fs.readFileSync(elementsDir + "/" + file).toString(), elementsDir + "/" + file);
                }
            });
        };
        for (var i in files) {
            setupElement(files[i]);
        }
    };
    
    function ejsRender() {
        return ejs.render.apply(ejs, arguments);
    }
    
    register(null, {
        "ejs": new EJSfile()
    });
};