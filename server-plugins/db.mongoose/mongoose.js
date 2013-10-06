"use strict";

module.exports = function(options, imports, register) {
    var mongoose = require('mongoose');
    
    var mongoHost = process.env.MONGOLAB_URI || options.HOST || "mongodb://localhost:27017/welder";
    mongoose.connect(mongoHost);
    
    var db = mongoose.connection;
    
    var MongooseSession = require("./mongooseSession.js")(mongoose,mongoose.Schema);
    
    var MongoosePlugin = {
        "db-mongoose": mongoose,
        "db-mongoose-session": new MongooseSession({ interval: 120000 })
    };
    
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback () {
        console.log("Mongoose Connected to",mongoHost);
        register(null, MongoosePlugin);
    });
};