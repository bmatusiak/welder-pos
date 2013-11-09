"use strict";

module.exports = function(db) {
    
    var Schema = db.Schema;
    
    var collection = "invoices";
    
    var modelSchema = new Schema({
        _id : { type: Number, index: true, unique:true },
        customer : { type: Number, ref: 'customers' },
        
        invoiceData: String ,
        
        created: Date,
        createdBy: String,
    });
    
    modelSchema.virtual('invoice').get(function() {
        return JSON.parse(calcInvoiceJSON(this.invoiceData));
    });
    modelSchema.virtual('data').get(function() {
        return JSON.parse(calcInvoiceJSON(this.invoiceData));
    });
    modelSchema.virtual('data').set(function (data) {
        this.invoiceData = JSON.stringify(data);
    });
    modelSchema.set('toJSON', { getters: true, virtuals: true });
    
    var Invoices = db.model(collection, modelSchema);
    
    var newInvoice = function(
        customerID,
        invoiceData,
        whoCreatedLogin,
        callback){
            db.counter("Invoices",1,function(count){
                var invoice = new Invoices();
                invoice._id = count;
                invoice.customer = customerID;
                invoice.invoiceData = JSON.stringify(invoiceData);
                invoice.created = new Date();
                invoice.createdBy = whoCreatedLogin;
                invoice.save(function(err){
                    callback(invoice.id);
                });
            });
    };
    
    var getInvoice = function(id,callback){
        Invoices.findOne({_id: id})
        .populate('customer')
        .exec(function(err, invoice) {
            if(!err && !invoice){
                callback("not exist");
            }else if(!err && invoice !== null){
                callback(null,invoice);
            }
        });
    };
    
    var listInvoices = function(callback){
        Invoices.find(function(err,invoices){
            callback(err,invoices);
        });
    };
    
    var invoicesPage = function(page,perPage,callback){
        Invoices.find({})
        .populate('customer')
        .limit(perPage)
        .skip(perPage * page)
        .sort({created: 'desc'})
        .exec(function(err, invoices) {
            Invoices.count().exec(function(err, count) {
                callback(null,{
                    results: invoices,
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
        customer : { type: Number, ref: 'customers' },
        
        dataJSON: String
    });
    
    draftSchema.virtual('data').get(function() {
        return JSON.parse(calcInvoiceJSON(this.dataJSON || JSON.stringify({})));
    });
    draftSchema.virtual('data').set(function (data) {
        this.dataJSON = JSON.stringify(data);
    });
    
    var Drafts = db.model("invoice-drafts", draftSchema);
    
    var updateDraft = function(
        customerID,
        draftObject,
        callback){
        if(!callback) callback=function(){};
        Drafts.findOne({customer: customerID})
        .populate('customer')
        .exec(function(err, draft) {
            if(!err && !draft){
                draft = new Drafts();
                draft.data = draftObject;
                draft.save(callback);
        
            }else if(!err && draft !== null){
                draft.data = draftObject;
                draft.save(callback);
            }
        });
    };
    
    var getDraft = function(
        customerID,
        callback){
        if(!callback) callback=function(){};
        Drafts.findOne({customer: customerID})
        .populate('customer')
        .exec(function(err, draft) {
            if(!err && !draft){
                draft = new Drafts();
                draft.customer = customerID;
                draft.save(function(){
                   callback(null,draft); 
                });
            }else if(!err && draft !== null){
                draft.save(function(){
                   callback(null,draft); 
                });
                    
            }
        });
    };
    
    
    return {
        //calcInvoiceJSON:calcInvoiceJSON,
        newInvoice:newInvoice,
        getInvoice:getInvoice,
        updateDraft:updateDraft,
        getDraft:getDraft,
        listInvoices:listInvoices,
        invoicesPage:invoicesPage
    };
};

