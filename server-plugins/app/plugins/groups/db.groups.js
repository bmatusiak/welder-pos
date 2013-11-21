"use strict";

module.exports = function(db) {
    
    var Schema = db.Schema;
    
    var collection = "groups";
    
    var groupsSchema = new Schema({
        groupname : { type: String, required: true },
        
        created: { type: Date, default: Date.now },
        createdBy: String,
        
        permissionsData:String
    });
    
    groupsSchema.virtual('permissions').get(function() {
        if(!this.permissionsData) return {};
        return JSON.parse(this.permissionsData);
    });
    groupsSchema.virtual('permissions').set(function (permissionsData) {
        this.permissionsData = JSON.stringify(permissionsData);
        this.save();
    });
    
    var Groups = db.model(collection, groupsSchema);
    
    var newGroup = function(name,permissionsObject,whoCreatedLogin,callback){
        Groups.findOne({name: name}, function(err,group){
            if(!err && !group){
                group = new Groups();
                group.groupname = name;
                group.createdBy = whoCreatedLogin;
                group.permissions = permissionsObject;
                group.save(callback);
            }else if(!err && group !== null){
                callback("exist");
            }
        });
    };
    
    var getGroup = function(name,callback){
        Groups.findOne({groupname: name}, function(err,group){
            if(!err && !group){
                callback("GroupName '"+name+"' does not exist");
            }else if(!err && group !== null){
                callback(null,group);
            }
        });
    };
    
    var listGroups = function(query,callback){
        Groups.find(query)
        .exec(function(err, data) {
            callback(null,{
                results: data,
                query:query
            });
        });
    };
    
    return {
        newGroup:newGroup,
        getGroup:getGroup,
        listGroups:listGroups
    };
};

