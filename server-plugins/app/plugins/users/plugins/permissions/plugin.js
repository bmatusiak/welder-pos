"use strict";

module.exports = function(options, imports, register) {
    
    var users = imports.users;
    var permissions = {};
    var db = imports.db;
    
    db.register({
            permissionsData:String
        },
        function(schema){       
            schema.virtual('permissions').get(function() {
                if(!this.permissionsData) return {};
                return JSON.parse(this.permissionsData);
            });
            schema.virtual('permissions').set(function (permissionsData) {
                this.permissionsData = JSON.stringify(permissionsData);
                this.save();
            });
            
        }
    );
    
    register(null, {
        "permissions": {
            get:function(callback){
                if(callback)
                    callback(permissions);
                return permissions;
            },
            register:function(name,def,description){
                permissions[name] = {description:description,value:def,scope:users.checkUserAuth(null,name)};
                return users.app.welder.http.sub(permissions[name].scope);
            },
        }
    });
};
