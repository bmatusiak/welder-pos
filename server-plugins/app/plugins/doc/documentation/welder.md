## Welder
--------

Welder plugin handles setting up the http side of things.

It allows other plugins to add there static files and middlewares.

order of execution is

1. StaticFiles
2. Middlewares
3. RequestParsers



###[welder.http](#http) Object 
> [welder.http.sub](#http.sub)
    
    this will create a sandbox so a certin route can have its own area of middlewares 
    and return a new blank "welder.http" object that can be used as middle ware itself
    
> [welder.http.use](#http.use)
    
    wraparound for http.use(); in this sub
    
> [welder.http.get](#http.get)

    wraparound for http.get(); in this sub

> [welder.http.post](#http.post)

    wraparound for http.post(); in this sub

> [welder.http.app](#http.app)

    direct object of running express app in this sub

> [welder.http.server](#http.server)
    
    sub instance of server.

> [welder.http.express](#http.express)
    
    direct object of express.

###[welder.addStatic](#addStatic) Function (string : mount,string : dir,bool : listDirAlso)
    
    > mount : Mountpoint from url
    > dir : directory to mount(fullpath)
    > listDirAlso : to give the mountpoint a document listing as html

###[welder.addStaticFile](#addStaticFile) Function (string : mountFile,string : File)
    
    > mount : Mountpoint from url
    > File : File to mount(fullpath)

###[welder.addMiddleWare](#addMiddleWare) Function (function : fn)
    
    > fn : function to add as middleware

###[welder.addRequestParser](#addRequestParser) Function (function : fn)
    
    > fn : function to add as Request Parser

