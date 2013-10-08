"use strict";

module.exports = function(db) {
    
    var Schema = db.Schema;
    
    var collection = "employees";
    
    var settingSchema = new Schema({
        username : String,
        userlogin : { type: String, index: true, unique:true },
        userpass : String,
        created: Date,
        createdBy: String,
    });
    
    var Employees = db.model(collection, settingSchema);
    
    var newEmployee = function(name,login,password,whoCreatedLogin,callback){
        Employees.findOne({name: name}, function(err,employee){
            if(!err && !employee){
                employee = new Employees();
                employee.username = name;
                employee.userlogin = login;
                employee.userpass = password;
                employee.created = Date.now();
                employee.createdBy = whoCreatedLogin;
                employee.save(callback);
            }else if(!err && employee !== null){
                callback("exist");
            }
        });
    };
    
    var getEmployee = function(login,callback){
        Employees.findOne({userlogin: login}, function(err,employee){
            if(!err && !employee){
                callback("not exist");
            }else if(!err && employee !== null){
                callback(null,employee);
            }
        });
    };
    
    var listEmployee = function(callback){
        Employees.find(function(err,employees){
            callback(err,employees);
        });
    };
    
    return {
        newEmployee:newEmployee,
        getEmployee:getEmployee,
        listEmployee:listEmployee
    };
};

