"use strict";

module.exports = function(options, imports, register) {
    
    var defaults = {};
    var settingDescription = {};
    var settingPlugin = {};
    
    var pos = imports.pos;
    var app = pos.app;
    
    var dbSettings = require("./db.settings.js")(app.db);
    
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
            for(var j in defaults){
                if(!_self[j]){
                    _self[j] = defaults[j];
                }
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
    
    AppSettings.prototype.define = function(pluginName, name,description,defaultVal){
        settingPlugin[name] = pluginName;
        defaults[name] = defaultVal;
        settingDescription[name] = description;
    };
    
    new AppSettings(function(settings){
        
        
        //update settigns per page request
        app.welder.addMiddleWare(function(http){
            http.use(function(req, res, next) {
                settings.load(function(){
                    next();
                });
            });
        });
        
        app.welder.addRequestParser(function(http){
            var scope = app.users.registerPermission("pos_settings",false,"Allow Editing POS Settings");
        
            scope
            .get("/pos/settings",function(req, res, next) {
                req.ejs(__dirname + "/settings.html",
                    {
                        settings:pos.settings,
                        settingDescription:settingDescription,
                        settingPlugin:settingPlugin
                    });
            })
            .post("/pos/settings",function(req, res, next) {
                settings.set(req.body.settingName,req.body.settingValue,function(){
                    res.redirect("/pos/settings");    
                });
            });
            
        });
        
        app.menus.
        register("USERDROPDOWN",{
            link:"/pos/settings",
            title:"POS Settings",
            sort:1000,
            permission:"pos_settings"
        });
        
        register(null, {
            "settings": settings
        });
    });
};
