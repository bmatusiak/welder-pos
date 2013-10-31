module.exports = function(options,imports,register){
    var MongooseSession = imports.app.db.session;
    
    var cookieID = options.key || "session.key";
    var secret = options.secret || process.env.SESSION_SECRET || "CHANGEME";
    
    imports.app.welder.addMiddleWare(function(http){
         http.use(http.express.session(
            {
                key: cookieID,   
                secret: secret, 
                store: MongooseSession,
                cookie: {
                    path: '/',
                    httpOnly: true,
                    maxAge: 1000 * 60 * 60 * 24 //one day(ish)  
                }
            }
        ));
    });
    
     register(null, {
        "session": {store:MongooseSession,cookieID:cookieID,secret:secret}
    });
};