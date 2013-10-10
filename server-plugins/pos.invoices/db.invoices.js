"use strict";

module.exports = function(db) {
    
    var Schema = db.Schema;
    
    var collection = "invoices";
    
    var modelSchema = new Schema({
        id : { type: Number, index: true, unique:true },
        customer_id : String,
        products:[{
            id:Number,
            name:String,
            model:String,
            price:String,
            quanity:Number,
            applyTax:Boolean
        }],
        
        created: Date,
        createdBy: String,
    });
    
    var Invoices = db.model(collection, modelSchema);
    
    var newInvoice = function(
        name,
        address,
        city,
        state,
        zip,
        email,
        phone,
        whoCreatedLogin,
        callback){
        Invoices.findOne({email: email}, function(err,employee){
            if(!err && !employee){
                db.counter("Customers",1000,function(count){
                    employee = new Invoices();
                    employee.id = count;
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
    
    var getInvoices = function(id,callback){
        Invoices.findOne({id: id}, function(err,employee){
            if(!err && !employee){
                callback("not exist");
            }else if(!err && employee !== null){
                callback(null,employee);
            }
        });
    };
    
    var listInvoices = function(callback){
        Invoices.find(function(err,employees){
            callback(err,employees);
        });
    };
    
    var invoicesPage = function(page,perPage,callback){
        Invoices.find({})
        .limit(perPage)
        .skip(perPage * page)
        .sort({date: 'desc'})
        .exec(function(err, blogs) {
            Invoices.count().exec(function(err, count) {
                callback(null,{
                    results: blogs,
                    page: page,
                    pages: count / perPage
                });
            });
        });
    };
    
    return {
        newInvoice:newInvoice,
        getInvoices:getInvoices,
        listInvoices:listInvoices,
        invoicesPage:invoicesPage
    };
};

