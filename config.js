//async config
module.exports = function(passConfig){
    passConfig([
        
        "./app.main",
        "./app.settings",
        "./app.setup",
        "./app.session",
        
        "./pos",
        "./pos.dashboard",
        "./pos.employees",
        "./pos.customers",
        "./pos.invoices",
        "./pos.products",
        "./pos.settings",
        
        "./lib.forms",
        "./socketio",
        "./lib.ejs",
        
        {
            packagePath: "./db.mongoose",
            HOST:  "mongodb://"+process.env.IP+":27017/welder"
        },
        
        
        "./welder"
        
    ]);
};

