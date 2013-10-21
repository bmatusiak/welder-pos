"use strict";

module.exports = function(db) {
    
    var Schema = db.Schema;
    
    var collection = "invoices";
    
    var modelSchema = new Schema({
        //id : { type: Number, index: true, unique:true },
        cid : { type: String, index: true, unique:true },
        products:[{
            unitid:Number,
            name:String,
            model:String,
            price:String,
            quanity:Number
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
                db.counter("Invoices",1000,function(count){
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
    
    
    //-------------------------------------------------------------
    
    
    var draftSchema = new Schema({
        //id : { type: Number, index: true, unique:true },
        cid : { type: Number, index: true, unique:true },
        data: String
    });
    
    var Drafts = db.model("invoice-drafts", draftSchema);
    var updateDraft = function(
        customerID,
        draftObject,
        callback){
        if(!callback) callback=function(){};
        Drafts.findOne({cid: customerID}, function(err,draft){
            if(!err && !draft){
                draft = new Drafts();
                draft.cid = customerID;
                draft.data = JSON.stringify(draftObject);
                draft.save(function(){
                    callback(null,JSON.parse(draft.data));
                });
        
            }else if(!err && draft !== null){
                draft.data = JSON.stringify(draftObject);
                draft.save(function(){
                    callback(null,JSON.parse(draft.data));
                });
            }
        });
    };
    
    var getDraft = function(
        customerID,
        callback){
        if(!callback) callback=function(){};
        Drafts.findOne({cid: customerID}, function(err,draft){
            if(!err && !draft){
                draft = new Drafts();
                draft.cid = customerID;
                draft.data = JSON.stringify({});
                draft.save(function(){
                   callback(null,JSON.parse(draft.data)); 
                });
            }else if(!err && draft !== null){
                if(!draft.data)
                    draft.data = JSON.stringify({});
                
                draft.save(function(){
                   callback(null,JSON.parse(draft.data)); 
                });
                    
            }
        });
    };
    
    
    return {
        newInvoice:newInvoice,
        getInvoices:getInvoices,
        updateDraft:updateDraft,
        getDraft:getDraft,
        listInvoices:listInvoices,
        invoicesPage:invoicesPage
    };
};

