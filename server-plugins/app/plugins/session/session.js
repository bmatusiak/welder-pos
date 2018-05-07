module.exports = function(options,imports,register){
    var MongooseSession = imports.app.db.session;
    
    var cookieID = options.key || "session.key";
    var secret = options.secret || process.env.SESSION_SECRET || "CHANGEME";
    
    var session = require('express-session')
    
    imports.app.welder.addMiddleWare(function(http){
        imports.app.welder.http.use(session(
            {
                key: cookieID,   
                secret: secret, 
                store: MongooseSession,
                cookie: {
                    path: '/',
                    httpOnly: true,
                    maxAge: 1000 * 60 * 60 * 24 //one day
                }
            }
        ));
    });
    
     register(null, {
        "session": {store:MongooseSession,cookieID:cookieID,secret:secret}
    });
};