"use strict";

module.exports = function(db) {
    
    var Schema = db.Schema;
    
    var collection = "customers";
    
    var customerSettingSchema = new Schema({
        uid : { type: Number, index: true},
        
        name : String,
        address : String,
        city : String,
        state : String,
        zip : String,
        email : {type: String, unique:true},
        phone : String,
        
        tax : String,
        
        notes : String,
        
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
    var Customers = db.model(collection, customerSettingSchema);
    
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
                    customer.uid = count;
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
    
    var editCustomer = function(
        _id,
        reqBody,
        callback){
        Customers.findOne({_id: _id}, function(err,customer){
            if(!err && customer){
                    customer.name = reqBody.name;
                    customer.address = reqBody.address;
                    customer.city = reqBody.city;
                    customer.state = reqBody.state;
                    customer.zip = reqBody.zip;
                    customer.email = reqBody.email;
                    customer.phone = reqBody.phone;
                    customer.notes = reqBody.notes;
                    customer.save().then(callback);
                    
            }else if(!err || !customer){
                callback("Edit Failed!");
            }
        });
    };
    
    var getCustomer = function(id,callback){
        Customers.findOne({uid: id}, function(err,customer){
            if(!err && !customer){
                callback("not exist");
            }else if(!err && customer !== null){
                callback(null,customer);
            }
        });
    };
    var queryCustomer = function(query,callback){
        Customers.findOne(query, function(err,customer){
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
        .sort({uid: 'desc'})
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
        editCustomer:editCustomer,
        getCustomer:getCustomer,
        queryCustomer:queryCustomer,
        listCustomer:listCustomer,
        customersPage:customersPage
    };
};

