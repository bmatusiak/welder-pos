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
        
        tax : String,
        
        invoices : [{ type: Schema.Types.ObjectId, ref: 'invoices' }],
        orders : [{ type: Schema.Types.ObjectId, ref: 'orders' }],
        
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
        Customers.findOne({email: email}, function(err,customer){
            if(!err && !customer){
                db.counter("Customers",1000,function(count){
                    customer = new Customers();
                    customer._id = count;
                    customer.name = name;
                    customer.address = address;
                    customer.city = city;
                    customer.state = state;
                    customer.zip = zip;
                    customer.email = email;
                    customer.phone = phone;
                    customer.created = Date.now();
                    customer.createdBy = whoCreatedLogin;
                    customer.save(callback);
                });
            }else if(!err && customer !== null){
                callback("User with Email Exist!");
            }
        });
    };
    
    var getCustomer = function(id,callback){
        Customers.findOne({_id: id}, function(err,customer){
            if(!err && !customer){
                callback("not exist");
            }else if(!err && customer !== null){
                callback(null,customer);
            }
        });
    };
    
    var listCustomer = function(callback){
        Customers.find(function(err,customer){
            callback(err,customer);
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

