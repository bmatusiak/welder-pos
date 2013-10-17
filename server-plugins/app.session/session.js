module.exports = function(options,imports,register){
    var MongooseSession = imports["db-mongoose-session"];
    
    var cookieID = options.key || "session.key";
    var secret = options.secret || process.env.SESSION_SECRET || "CHANGEME";
    
    imports.welder.addMiddleWare(function(http){
         http.app.use(http.express.session(
            {
                key: cookieID,   
                secret: secret, 
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
        "session": {store:MongooseSession,cookieID:cookieID,secret:secret}
    });
};