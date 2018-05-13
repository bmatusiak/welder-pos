   
##[app](app.md)  Object 


###[app.ejs](app.ejs.md) Object 

    this is also built into http request,    
    req.ejs(filename, options, callback)
    
#####[app.ejs.renderFile](app.md#ejs)(filename, options, callback) Function

    filename : string : fullpath to file to render.

#####[app.ejs.render](app.md#ejs)(str, options, callback) Function

    str : string : full path to dir to add as a static option
    options : object : list of options to add for this render
    callback : function : full path to dir to add as a static option

#####[app.ejs.options](app.md#ejs)(options) Function

    options object to be set
    
    options : object : object of options    

#####[app.ejs.staticOption](app.md#ejs)(name,option) Function

    this gets added in with every render
    name : string : name of the option
    option : *object : the option to be saved

#####[app.ejs.use](app.md#ejs)(elementsDir,returnObject) Function

    elementsDir : string : full path to dir to add as a static option
    returnObject : object : sending a empty object to be filled with functions to be used as options
