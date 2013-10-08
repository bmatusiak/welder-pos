"use strict";

module.exports = function(options, imports, register) {
    
    var dbSettings = require("./db.settings.js")(imports["db-mongoose"]);
    //dbSettings.setSetting
    //dbSettings.getSetting
    //dbSettings.getSettingsList
    
    function AppSettings(done){
        this.load(done);
    }
    
    AppSettings.prototype.load = function(callback){
        var _self = this;
        for(var j in _self){
            delete _self[j];
        }
        dbSettings.getSettingsList(function($settings){
            for(var i in $settings){
                _self[$settings[i].name] = $settings[i].value;
            }
            callback(_self);
        });
    };
    
    AppSettings.prototype.set = function(name,value,callback){
        var _self = this;
        dbSettings.setSetting(name,value,function(err,setting){
            _self.load(function(){
                callback();
            });
        });
    };
    
    new AppSettings(function(settings){
        register(null, {
            "settings": settings
        });
    });
};
