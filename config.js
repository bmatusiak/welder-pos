//async config
module.exports = function(passConfig){
    passConfig([
        
        "./app.main",
        
        "./app.settings",
        
        "./app.setup",
        
        "./pos.employees",
        
        "./pos.customers",
        
        "./pos.invoices",
        
        "./pos.products",
        
        "./lib.forms",
        
        "./lib.ejs",
        
        {
            packagePath: "./db.mongoose",
            HOST:  "mongodb://"+process.env.IP+":27017/welder"
        },
        
        "./app.session",
        
        "./welder"
        
    ]);
};

