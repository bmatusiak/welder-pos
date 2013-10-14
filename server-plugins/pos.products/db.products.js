"use strict";

module.exports = function(db) {
    
    var Schema = db.Schema;
    
    var collection = "products";
    
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
    
    var Products = db.model(collection, modelSchema);
    
    var newProduct = function(
        name,
        address,
        city,
        state,
        zip,
        email,
        phone,
        whoCreatedLogin,
        callback){
        Products.findOne({email: email}, function(err,employee){
            if(!err && !employee){
                db.counter("Products",1000,function(count){
                    employee = new Products();
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
    
    var getProducts = function(id,callback){
        Products.findOne({id: id}, function(err,employee){
            if(!err && !employee){
                callback("not exist");
            }else if(!err && employee !== null){
                callback(null,employee);
            }
        });
    };
    
    var listProducts = function(callback){
        Products.find(function(err,employees){
            callback(err,employees);
        });
    };
    
    var productsPage = function(page,perPage,callback){
        Products.find({})
        .limit(perPage)
        .skip(perPage * page)
        .sort({date: 'desc'})
        .exec(function(err, blogs) {
            Products.count().exec(function(err, count) {
                callback(null,{
                    results: blogs,
                    page: page,
                    pages: count / perPage
                });
            });
        });
    };
    
    return {
        newProduct:newProduct,
        getProducts:getProducts,
        listProducts:listProducts,
        productsPage:productsPage
    };
};

