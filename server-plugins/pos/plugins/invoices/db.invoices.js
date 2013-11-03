"use strict";

module.exports = function(db) {
    
    var Schema = db.Schema;
    
    var collection = "invoices";
    
    var modelSchema = new Schema({
        id : { type: Number, index: true, unique:true },
        cid : String,
        
        invoiceData: String ,
        
        created: Date,
        createdBy: String,
    });
    
    var Invoices = db.model(collection, modelSchema);
    
    var newInvoice = function(
        customerID,
        invoiceData,
        whoCreatedLogin,
        callback){
            db.counter("Invoices",1,function(count){
                var invoice = new Invoices();
                invoice.id = count;
                invoice.cid = customerID;
                invoice.invoiceData = JSON.stringify(invoiceData);
                invoice.created = Date.now();
                invoice.createdBy = whoCreatedLogin;
                invoice.save(function(err){
                    callback(invoice.id);
                });
            });
    };
    
    var getInvoice = function(id,callback){
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
    
    var calcInvoiceJSON = function(invoiceJSON){
        var invoiceObj = JSON.parse(invoiceJSON);
        
        invoiceObj.stotal = 0;
        invoiceObj.ttotal = 0;
        invoiceObj.total = 0; 
        
        for(var i in invoiceObj){
            var unitData = invoiceObj[i];
            if(typeof unitData !== "object") continue;
            
            unitData.price = parseFloat(unitData.productPrice) * parseFloat(unitData.productQuanity);
            
            for(var j in unitData.attribute){
                unitData.price += parseFloat(unitData.attribute[j].productPrice) * (parseFloat(unitData.attribute[j].productQuanity)* parseFloat(unitData.productQuanity));
            }
            unitData.tax = unitData.price * 0.06;
            unitData.total = unitData.price+(unitData.price * 0.06);
            
            invoiceObj.stotal += unitData.price;
            invoiceObj.ttotal += unitData.price * 0.06;
            invoiceObj.total  += unitData.price+(unitData.price * 0.06);
        }
        //invoiceObj.stotal = invoiceObj.stotal.toFixed(2);
        //invoiceObj.ttotal = invoiceObj.ttotal.toFixed(2);
        //invoiceObj.total = invoiceObj.total.toFixed(2);
        
        return JSON.stringify(invoiceObj);
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
        calcInvoiceJSON:calcInvoiceJSON,
        newInvoice:newInvoice,
        getInvoice:getInvoice,
        updateDraft:updateDraft,
        getDraft:getDraft,
        listInvoices:listInvoices,
        invoicesPage:invoicesPage
    };
};

