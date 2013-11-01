"use strict";

module.exports = function(options, imports, register) {
    var mongoose = require('mongoose');
    
    var mongoHost = process.env.MONGOLAB_URI || options.HOST || "mongodb://localhost:27017/welder";
    console.log("Mongoose Connecting to",mongoHost);
    mongoose.connect(mongoHost);
    
    var db = mongoose.connection;
    
    mongoose.counter = require("./indexCounter.js")(mongoose);
    mongoose.session = new (require("./mongooseSession.js")(mongoose,mongoose.Schema))({ interval: 120000 });
    
    var DatabasePlugin = {
        "db": mongoose
    };
    
    db.on('error', function(err){
        var cErr = console.error.bind(console, 'Mongoose Connection error:');
        cErr(err);
        register(err);
    });
    db.once('open', function callback () {
        console.log("Mongoose Connected");
        register(null, DatabasePlugin);
    });
};