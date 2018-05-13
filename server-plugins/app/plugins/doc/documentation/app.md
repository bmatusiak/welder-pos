#app
----------

# [app](app.md)  Object 

    loads plugin objects listed below

####[app.admin](app.md#admin)  Object 

    this plugin setups up /admin area, this provided a area for plugins to me managed

####[app.doc](app.md#doc) Object 

    this document editor

####[app.ejs](app.ejs.md) Object 

    this is also built into http request,    
    req.ejs(filename, options, callback)

####[app.emailer](app.md#emailer) Object 

    this plugin provides a way to send emails
    {
        enabled :bool,
        templates:string,
        sendTemplate:function(temlateFile,email,ejs_data,callback),
        send:function(email,subject,body,callback)
    }
    
    
####[app.forms](app.forms.md) Object 

    this plugin provides a way to 
    {
        get: function(path,$formObject),
        condition : function(condition,callback),
        post : function(path,$formObject)
    }

####[app.groups](app.md#groups) Object 

    this plugin provides group abiiltiy for users
    {
        register:function(groupName,permissions)
    }

####[app.menus](app.md#menus) Object 

    this plugin provides a way to add menus to parts of a template
    {
        register:function(area,data),
        get:function(area,req)
    }

####[app.serializer](app.md#serializer) Object 

    this plugin provides serializition for other plugins
    the methods parse(obj) and stringify(str)

####[app.session](app.md#session) Object 

    this plugin provides session handeling for users
    {
        store:MongooseSession,
        cookieID:cookieID,
        secret:secret
    }

####[app.settings](app.md#settings) Object 

    this plugin provides a area for a admin to edit critical settings
    {
        set:function(name,value,callback),
        load:function(callback)
    }

    after setting a setting, it will become apart of that object, ie.

    settings.set("myName","someValue",function(settings){
        console.log(settings.myName)//will print "someValue"
    })
    
    

####[app.setup](app.md#setup) Object 

    this plugin provided first time app setup

####[app.sockets](app.md#sockets) Object 

    this plugin provides web sockets
    {
        addSocketConnection:function(callback),
        addSocketUserConnection:function(callback)
    }
    
####[app.users](app.md#users) Object 

    this plugin provided users ability{
        addUser:function(name,login,password,email,whoCreatedLogin,callback),
        checkUserAuth:function(type,permission)
    }


