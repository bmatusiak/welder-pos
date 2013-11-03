"use strict";
//http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt
//this link to secure up user's passwords
module.exports = function(db) {
    
    var Schema = db.Schema;
    
    var collection = "users";
    
    var settingSchema = new Schema({
        username : String,
        userlogin : { type: String, index: true, unique:true },
        userpass : String,
        created: Date,
        createdBy: String,
    });
    
    var Users = db.model(collection, settingSchema);
    
    var newUser = function(name,login,password,whoCreatedLogin,callback){
        Users.findOne({name: name}, function(err,user){
            if(!err && !user){
                user = new Users();
                user.username = name;
                user.userlogin = login;
                user.userpass = password;
                user.created = Date.now();
                user.createdBy = whoCreatedLogin;
                user.save(callback);
            }else if(!err && user !== null){
                callback("exist");
            }
        });
    };
    
    var getUser = function(login,callback){
        Users.findOne({userlogin: login}, function(err,user){
            if(!err && !user){
                callback("UserName '"+login+"' does not exist");
            }else if(!err && user !== null){
                callback(null,user);
            }
        });
    };
    
    var listUser = function(callback){
        Users.find(function(err,users){
            callback(err,users);
        });
    };
    
    return {
        newUser:newUser,
        getUser:getUser,
        listUser:listUser
    };
};

