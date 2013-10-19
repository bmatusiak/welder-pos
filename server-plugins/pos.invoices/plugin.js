"use strict";

module.exports = function(options, imports, register) {
    
    var main = imports.main;
    
    var db = require("./db.invoices.js")(imports["db-mongoose"]);
    
    imports.main.welder.addRequestParser(function(http){
        
        http.app.get('/invoices', imports.posEmployees.checkEmployeeAuth, function(req, res, next) {
            db.invoicesPage(req.query.page-1 || 0,50,
                function(err,invoices){
                    if(!err){
                        res.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
                        main.ejs.renderFile(__dirname + "/invoices.html",{invoices:invoices,req:req,settings:main.settings},function(err,data){
                            res.end(data);
                        });
                    }else {
                        res.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
                        main.ejs.renderFile(main.dir.template + "/error.html",{error:err},function(err,data){
                            res.end(data);
                        });
                    }
                });
        });
        
        http.app.get('/invoices/new/:id?',
            imports.posEmployees.checkEmployeeAuth, 
            main.Form.get(__dirname + "/newInvoice.html",{next:function(req,res,callback){
                imports.posCustomers.db.getCustomer(req.params.id,function(err,customer){
                    callback(err,{customer:customer});
                })
            }}));
        
        
    });
    
    imports.socketio.on("connection",function(socket){
        socket.on("invoice-save-draft",function(customerID,data,callback){
            db.updateDraft(customerID,data,function(){
                if(callback) callback();    
            });
        });
        socket.on("invoice-load-draft",function(customerID,callback){
            db.getDraft(customerID,function(err,data){
                if(callback) callback(err,data);    
            });
        });
    });
    
    register(null, {
        "posInvoices": {}
    });

};
