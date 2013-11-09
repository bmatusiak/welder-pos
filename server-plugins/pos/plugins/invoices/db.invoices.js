"use strict";

module.exports = function(db) {
    
    var Schema = db.Schema;
    
    var collection = "invoiceDocs";
    
    var modelSchema = new Schema({
        id : Number,
        
        // _id is a generated mongodb ObjectID
        
        customer : { type: Number, ref: 'customers' },
        
        locked: Boolean,
        calculated: Boolean,
        
        type: String,
        
        docData: String,
        //data:VIRTUAL, gets and sets docData based on type
        
        parent: { type: Schema.Types.ObjectId, ref: collection },
        child: { type: Schema.Types.ObjectId, ref: collection },
        
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
    
    modelSchema.pre('save', function(next) {
        var doc = this;
        
        if(doc.locked)
            return next(new Error("Document is Locked"));
            
        if(doc.type === "invoice")
            doc.locked = true;
        
        
        next();
    });
    
    var InvoiceDocs = db.model(collection, modelSchema);
    
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
            getDoc({_id:docObj._id},function(err,doc){
                var newDoc;
                if(doc && docObj.type !== "draft" && !doc.child){
                    newDoc = new InvoiceDocs();
                    newDoc.parent = doc._id;
                    newDoc.customer = doc.customer;
                    newDoc.type = docObj.type;
                    newDoc.data = doc.data;
                    newDoc.created = new Date();
                    newDoc.createdBy = whoCreatedLogin;
                    if(newDoc.type === "invoice")
                        db.counter("Invoices",1,function(count){
                            newDoc.id = count;
                            save();
                        });      
                    else 
                        save();
                } else if(!doc && docObj.type == "draft"){
                    newDoc = new InvoiceDocs();
                    newDoc.customer = docObj.customer;
                    newDoc.data = docObj.data;
                    newDoc.type = docObj.type;
                    newDoc.created = new Date();
                    newDoc.createdBy = whoCreatedLogin;
                    save();
                } else
                    callback("New Document Failed to Create",docObj);
                
                function save(){
                    newDoc.save(function(err,_doc){
                        getDoc({_id:_doc._id},function(err,__doc){
                            callback(err,__doc);
                        });
                        if(doc && doc.type !== "draft"){
                            doc.child = _doc._id;
                            doc.save();
                        }
                    });
                }
                
            });
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
            unitData.tax = unitData.price * 0.06;
            unitData.total = unitData.price+(unitData.price * 0.06);
            
            docObj.stotal += unitData.price;
            docObj.ttotal += unitData.price * 0.06;
            docObj.total  += unitData.price+(unitData.price * 0.06);
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

