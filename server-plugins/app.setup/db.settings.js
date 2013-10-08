"use strict";

module.exports = function(db) {
    
    var Schema = db.Schema;
    
    var collection = "settings";
    
    //OpenAuth Service Database Model
    var settingSchema = new Schema({
        name : { type: String, index: true, unique:true },
        value : String,
        updated: Date
    });
    
    var Settings = db.model(collection, settingSchema);
    
    var setSetting = function(name,value,callback){
        Settings.findOne({name: name}, function(err,setting){
            if(!err && !setting){
                setting = new Settings();
                setting.name = name;
                setting.value = value;
                setting.updated = Date.now();
                setting.save(callback);
            }else if(!err && setting !== null){
                setting.updated = Date.now();
                setting.value = value;
                setting.save(callback);
            }
        });
    };
    
    var getSetting = function(name,callback){
         Settings.findOne({name: name}, function(err,setting){
            if(!err && !setting){
                callback("not exist");
            }else if(!err && setting !== null){
                callback(null,setting.value);
            }
        });
    };
    
    var getSettingsList = function(callback){
        Settings.find(function(err, settings) {
            if(err) 
                callback([]);
            else
                callback(settings);
        });
    };
    
    return {
        setSetting:setSetting,
        getSetting:getSetting,
        getSettingsList:getSettingsList
    };
};

