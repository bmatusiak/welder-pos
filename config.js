//async config
module.exports = function(passConfig){
    passConfig([
        
        "./app.main",
        
        "./app.setup",
        
        "./pos.employees",
        
        "./lib.ejs",
        
        {
            packagePath: "./db.mongoose",
            HOST:  "mongodb://"+process.env.IP+":27017/welder"
        },
        
        "./app.session",
        
        "./welder"
        
    ]);
};

