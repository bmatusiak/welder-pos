"use strict";

module.exports = function(db) {
    
    var Schema = db.Schema;
    
    var collection = "customers";
    
    var settingSchema = new Schema({
        _id : { type: Number, index: true, unique:true },
        
        name : String,
        address : String,
        city : String,
        state : String,
        zip : String,
        email : String,
        phone : String,
        
        invoices : [{ type: Schema.Types.ObjectId, ref: 'invoices' }],
        
        created: Date,
        createdBy: String,
    });
    /*
name
address
city
state
zip
email
phone
*/
    var Customers = db.model(collection, settingSchema);
    
    var newCustomer = function(
        name,
        address,
        city,
        state,
        zip,
        email,
        phone,
        whoCreatedLogin,
        callback){
        Customers.findOne({email: email}, function(err,employee){
            if(!err && !employee){
                db.counter("Customers",1000,function(count){
                    employee = new Customers();
                    employee._id = count;
                    employee.name = name;
                    employee.address = address;
                    employee.city = city;
                    employee.state = state;
                    employee.zip = zip;
                    employee.email = email;
                    employee.phone = phone;
                    employee.created = Date.now();
                    employee.createdBy = whoCreatedLogin;
                    employee.save(callback);
                });
            }else if(!err && employee !== null){
                callback("User with Email Exist!");
            }
        });
    };
    
    var getCustomer = function(id,callback){
        Customers.findOne({_id: id}, function(err,employee){
            if(!err && !employee){
                callback("not exist");
            }else if(!err && employee !== null){
                callback(null,employee);
            }
        });
    };
    
    var listCustomer = function(callback){
        Customers.find(function(err,employees){
            callback(err,employees);
        });
    };
    
    var customersPage = function(page,perPage,callback){
        Customers.find({})
        .limit(perPage)
        .skip(perPage * page)
        .sort({date: 'desc'})
        .exec(function(err, blogs) {
            Customers.count().exec(function(err, count) {
                callback(null,{
                    results: blogs,
                    page: page,
                    pages: count / perPage
                });
            });
        });
    };
    
    return {
        newCustomer:newCustomer,
        getCustomer:getCustomer,
        listCustomer:listCustomer,
        customersPage:customersPage
    };
};

