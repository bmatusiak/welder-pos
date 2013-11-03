"use strict";

module.exports = function(options, imports, register) {
    
    var pos = imports.pos;
    
    var db = require("./db.invoices.js")(pos.app.db);
    
    register(null, {
        "invoices": {
            db:db,
            moduleDir:__dirname+"/static",
            socketUserConnection:function(socket){
                socket.on("invoice-create-open",function(customerId,invoiceObject,callback){
                    db.newInvoice(customerId,invoiceObject,socket.session.user,function(invoiceID){
                        callback(invoiceID);
                    });
                });
                socket.on("invoice-save-draft",function(customerID,data,callback){
                    db.updateDraft(customerID,data,function(){
                        var invoiceJSON = db.calcInvoiceJSON(JSON.stringify(data));
                        if(callback) callback(null,JSON.parse(invoiceJSON));    
                    });
                });
                socket.on("invoice-load-draft",function(customerID,callback){
                    db.getDraft(customerID,function(err,data){
                        var invoiceJSON = db.calcInvoiceJSON(JSON.stringify(data));
                        if(callback) callback(err,JSON.parse(invoiceJSON));    
                    });
                });
                socket.on("invoice-product-lookup",function(name,model,callback){
                    var query = {};
                    if(name){
                        query.name = new RegExp(name.split(" ").join("|"), "gi");
                        //query.name = new RegExp(name, "gi");
                    }
                    if(model)
                        query.model = model;
                      
                    pos.products.db.listProducts(query,function(err,data){
                        if(callback) callback(err,data);    
                    });
                }); 
            },
            httpConnection:function(http){
                http.get('/invoices', pos.app.users.checkUserAuth(), function(req, res, next) {
                    db.invoicesPage(req.query.page-1 || 0,50,
                        function(err,invoices){
                            if(!err){
                                res.writeHead(200, {
                                    'Content-Type': 'text/html'
                                });
                                pos.app.ejs.renderFile(__dirname + "/invoices.html",{pos:pos,invoices:invoices,req:req,settings:pos.app.settings},function(err,data){
                                    res.end(data);
                                });
                            }else {
                                res.writeHead(200, {
                                    'Content-Type': 'text/html'
                                });
                                pos.app.ejs.renderFile(pos.app.dir.template + "/error.html",{error:err},function(err,data){
                                    res.end(data);
                                });
                            }
                        });
                });
                
                http.get('/invoices/new/:id?',
                    pos.app.users.checkUserAuth(), 
                    pos.app.Form.get(__dirname + "/newInvoice.html",{next:function(req,res,callback){
                        pos.customers.db.getCustomer(req.params.id,function(err,customer){
                            callback(err,{customer:customer});
                        });
                    }}));
            }
        }
    });

};
