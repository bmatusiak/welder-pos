"use strict";

module.exports = function(options, imports, register) {
    
    var pos = imports.pos;
    
    var db = require("./db.invoices.js")(pos.app.db);
    
    register(null, {
        "invoices": {
            db:db,
            moduleDir:__dirname+"/static",
            socketUserConnection:function(socket){
                socket.on("invoice-new",function(doc,callback){
                    if(!doc.type) doc.type == "draft";
                    
                    if(doc.type == "draft")
                        doc.type = "order";
                    else if(doc.type == "order")
                        doc.type = "invoice";
                    
                    db.newDoc(doc,socket.session.user,function(err,doc){
                        callback(err,doc);
                    });
                });
                socket.on("invoice-save",function(docID,docData,callback){
                    db.getDoc({_id:docID},function(err,doc){
                        if(doc.locked) return callback("locked",doc);
                        doc.data = docData;
                        doc.save(function(err,doc){
                            if(callback) callback(err,doc);
                        });
                    });
                });
                socket.on("invoice-load",function(docID,callback){
                    db.getDoc({_id:docID},function(err,doc){
                        if(callback) callback(err,doc);    
                    });
                });
                socket.on("invoice-calculate",function(docData,callback){
                    callback(null,db.calcData(docData));
                });
                
                //************************ 
                socket.on("invoice-product-lookup",function(name,model,callback){
                    var query = {};
                    if(name){
                        query.name = new RegExp(name.split(" ").join("|"), "gi");
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
                    db.invoicesPage(req.query.page-1 || 0,2,
                        function(err,docs){
                            if(!err){
                                res.writeHead(200, {
                                    'Content-Type': 'text/html'
                                });
                                pos.app.ejs.renderFile(__dirname + "/invoices.html",{pos:pos,docs:docs,req:req},function(err,data){
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
                
                http.get('/invoices/:id/:customerid?',
                    pos.app.users.checkUserAuth(), 
                    pos.app.Form.get(__dirname + "/invoice-view.html",{next:function(req,res,callback){
                        if(req.params.id == "new"){
                            /*
                            pos.customers.db.getCustomer(req.params.customerid,function(err,customer){
                                callback(err,{customer:customer});
                            });
                            */
                            db.getDoc({customer:req.params.customerid,type:"draft"},function(err,doc){
                                if(!doc && err){
                                    db.newDoc({data:{},type:"draft",customer:req.params.customerid},req.session.user,function(err,doc){
                                        callback(err,{doc:doc});
                                    });
                                }else 
                                    callback(err,{doc:doc});
                            });
                        }else{
                            db.getDoc({_id:req.params.id},function(err,doc){
                                //console.log(doc)
                                if(err){
                                    res.writeHead(200, {
                                        'Content-Type': 'text/html'
                                    });
                                    pos.app.ejs.renderFile(pos.app.dir.template + "/error.html",{error:err},function(err,data){
                                        res.end(data);
                                    });
                                }else
                                callback(err,{doc:doc});
                            });
                        }
                    }}));
            }
        }
    });

};
