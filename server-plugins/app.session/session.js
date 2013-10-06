module.exports = function(options,imports,register){
    var MongooseSession = imports["db-mongoose-session"];
    
    imports.welder.addMiddleWare(function(http){
         http.app.use(http.express.session(
            {
                key: options.key || "session.key",   
                secret: options.secret || process.env.SESSION_SECRET || "CHANGEME", 
                store: MongooseSession,
                cookie: {
                    path: '/',
                    httpOnly: true,
                    maxAge: 1000 * 60 * 60 * 24 //one year(ish)  
                }
            }
        ));
    });
    
     register(null, {
        "session": {}
    });
};