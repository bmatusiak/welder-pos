//async config
module.exports = function(passConfig){
    passConfig([
        
        "./app.main",
        
        "./lib.ejs",
        
        {
            packagePath: "./db.mongoose",
            HOST:  "mongodb://"+process.env.IP+":27017/welder"
        },
        
        "./app.session",
        
        "./welder"
        
    ]);
};

