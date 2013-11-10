"use strict";
//http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt
//this link to secure up user's passwords
var bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10,
    MAX_LOGIN_ATTEMPTS = 5,
    LOCK_TIME = 2 * 60 * 60 * 1000;
    
module.exports = function(db) {
    
    var Schema = db.Schema;
    
    var collection = "users";
    
    var usersSchema = new Schema({
        username : { type: String, required: true },
        userlogin : { type: String, index: true, unique:true, required: true },
        userpass : { type: String, required: true },
        created: { type: Date, default: Date.now },
        createdBy: String,
        loginAttempts: { type: Number, required: true, default: 0 },
        lockUntil: { type: Number },
        
        permissionsData:String
    });
    
    var reasons = usersSchema.statics.failedLogin = {
        NOT_FOUND: 0,
        PASSWORD_INCORRECT: 1,
        MAX_ATTEMPTS: 2
    };
    
    usersSchema.virtual('permissions').get(function() {
        if(!this.permissionsData) return {};
        return JSON.parse(this.permissionsData);
    });
    usersSchema.virtual('permissions').set(function (permissionsData) {
        this.permissionsData = JSON.stringify(permissionsData);
        this.save();
    });
    
    usersSchema.virtual('isLocked').get(function() {
        // check for a future lockUntil timestamp
        return !!(this.lockUntil && this.lockUntil > Date.now());
    });

    usersSchema.methods.comparePassword = function(candidatePassword, cb) {
        bcrypt.compare(candidatePassword, this.userpass, function(err, isMatch) {
            if (err) return cb(err);
            cb(null, isMatch);
        });
    };
    
    usersSchema.methods.incLoginAttempts = function(cb) {
        // if we have a previous lock that has expired, restart at 1
        if (this.lockUntil && this.lockUntil < Date.now()) {
            return this.update({
                $set: { loginAttempts: 1 },
                $unset: { lockUntil: 1 }
            }, cb);
        }
        // otherwise we're incrementing
        var updates = { $inc: { loginAttempts: 1 } };
        // lock the account if we've reached max attempts and it's not locked already
        if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
            updates.$set = { lockUntil: Date.now() + LOCK_TIME };
        }
        return this.update(updates, cb);
    };
    
    
    usersSchema.pre('save', function(next) {
        var user = this;
    
        // only hash the password if it has been modified (or is new)
        if (!user.isModified('userpass')) return next();
    
        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err) return next(err);
    
            // hash the password using our new salt
            bcrypt.hash(user.userpass, salt, function(err, hash) {
                if (err) return next(err);
    
                // override the cleartext password with the hashed one
                user.userpass = hash;
                next();
            });
        });
    });
    
    var Users = db.model(collection, usersSchema);
    
    var auth = function(username, password, cb) {
        Users.findOne({ userlogin: username }, function(err, user) {
            if (err) return cb(err);
    
            // make sure the user exists
            if (!user) {
                return cb(null, null, reasons.NOT_FOUND);
            }
    
            // check if the account is currently locked
            if (user.isLocked) {
                // just increment login attempts if account is already locked
                return user.incLoginAttempts(function(err) {
                    if (err) return cb(err);
                    return cb(null, null, reasons.MAX_ATTEMPTS);
                });
            }
    
            // test for a matching password
            user.comparePassword(password, function(err, isMatch) {
                if (err) return cb(err);
    
                // check if the password was a match
                if (isMatch) {
                    // if there's no lock or failed attempts, just return the user
                    if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
                    // reset attempts and lock info
                    var updates = {
                        $set: { loginAttempts: 0 },
                        $unset: { lockUntil: 1 }
                    };
                    return user.update(updates, function(err) {
                        if (err) return cb(err);
                        return cb(null, user);
                    });
                }
    
                // password is incorrect, so increment login attempts before responding
                user.incLoginAttempts(function(err) {
                    if (err) return cb(err);
                    return cb(null, null, reasons.PASSWORD_INCORRECT);
                });
            });
        });
    };
    
    var newUser = function(name,login,password,whoCreatedLogin,callback){
        Users.findOne({name: name}, function(err,user){
            if(!err && !user){
                user = new Users();
                user.username = name;
                user.userlogin = login;
                user.userpass = password;
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
        auth:auth,
        newUser:newUser,
        getUser:getUser,
        listUser:listUser
    };
};

