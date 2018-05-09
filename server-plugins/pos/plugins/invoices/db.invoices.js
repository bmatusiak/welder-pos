"use strict";

module.exports = function(db) {
    
    var Schema = db.Schema;
    
    var collectionName = "invoices";
    
    var taxPercentage = 0.065
    
    var modelSchema = new Schema({
        invoiceid : { type: Number, index: true},
        
        // _id is a generated mongodb ObjectID
        
        customer : { type: String, ref: 'customers' },
        
        locked: Boolean,
        calculated: Boolean,
        
        type: String,
        
        docData: String,
        //data:VIRTUAL, gets and sets docData based on type
        
        //parent: { type: Schema.Types.ObjectId, ref: collectionName },
        //child: { type: Schema.Types.ObjectId, ref: collectionName },
        
        created: Date,
        createdBy: String,
    });
    
    modelSchema.virtual('data').get(function() {
        var dataObj;
        dataObj = JSON.parse(this.docData)
        return calcData(dataObj);
    });
    modelSchema.virtual('data').set(function (data) {
        if(this.locked) return;
        this.docData = JSON.stringify(data);
        this.calculated = true;
    });
    
    modelSchema.set('toJSON', { getters: true, virtuals: true });
    
    /*
    modelSchema.pre('save', function(next) {
        var doc = this;
        
        if(doc.locked)
            return next(new Error("Document is Locked"));
            
        if(doc.type === "invoice")
            doc.locked = true;
        
        
        next();
    });
    */
    
    var InvoiceDocs = db.model(collectionName, modelSchema);
    
    var getDoc = function(query,callback){
        InvoiceDocs.findOne(query)
        .populate('customer')
        .exec(function(err, doc) {
            if(err || !doc){
                callback("not exist");
            }else if(!err && doc !== null){
                callback(null,doc);
            }
        });
    };
    
    var newDoc = function(
        docObj,
        whoCreatedLogin,
        callback){
            //getDoc({invoiceid:docObj.invoiceid},function(err,doc){
                var newDoc;
                
                    newDoc = new InvoiceDocs();
                    //newDoc.parent = doc.invoiceid;
                    newDoc.customer = docObj.customer;
                    newDoc.data = docObj.data;
                    newDoc.created = new Date();
                    newDoc.createdBy = whoCreatedLogin;
                    db.counter(collectionName,1,function(count){
                        newDoc.invoiceid = count;
                        save(newDoc);
                    });      
                    
                    
                function save(newDoc){
                    newDoc.save().then(function(_doc){
                        getDoc({invoiceid:_doc.invoiceid},function(err,__doc){
                            callback(err,__doc);
                        });
                    });
                }
                
            //});
    };
    
    var listDocs = function(query,callback){
        InvoiceDocs.find(query)
        .populate('customer')
        .exec(function(err, docs) {
            callback(err,docs);
        });
    };
    
    var pageDocs = function(query,page,perPage,callback){
        InvoiceDocs.find(query)
        .populate('customer')
        .limit(perPage)
        .skip(perPage * page)
        .sort({created: 'desc'})
        .exec(function(err, docs) {
            InvoiceDocs.count(query).exec(function(err, count) {
                callback(null,{
                    results: docs,
                    page: page,
                    pages: count / perPage
                });
            });
        });
    };
    
    var calcData = function(docObj){
        
        docObj.stotal = 0;
        docObj.ttotal = 0;
        docObj.total = 0; 
        
        for(var i in docObj){
            var unitData = docObj[i];
            if(typeof unitData !== "object") continue;
            
            unitData.price = parseFloat(unitData.productPrice) * parseFloat(unitData.productQuanity);
            
            for(var j in unitData.attribute){
                unitData.price += parseFloat(unitData.attribute[j].productPrice) * (parseFloat(unitData.attribute[j].productQuanity)* parseFloat(unitData.productQuanity));
            }
            unitData.tax = unitData.price * taxPercentage;
            unitData.total = unitData.price+(unitData.price * taxPercentage);
            
            docObj.stotal += unitData.price;
            docObj.ttotal += unitData.price * taxPercentage;
            docObj.total  += unitData.price+(unitData.price * taxPercentage);
        }
        return docObj;
    };
    
    
    return {
        calcData:calcData,
        newDoc:newDoc,
        getDoc:getDoc,
        listDocs:listDocs,
        pageDocs:pageDocs
    };
};

