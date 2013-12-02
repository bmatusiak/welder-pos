//async config
module.exports = function(passConfig){
    passConfig([
        
        //"./pos",
        
        {
            packagePath:"./app",
            pluginOptions:{
                session:{
                    key:"session.key",
                    secret:"CHANGEME"
                }
            }
        },
        
        
        {
            packagePath: "./db.mongoose",
            HOST:  "mongodb://localhost:27017/welder"
        },
        
        
        "./welder"
        
    ]);
};

