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
        
        http.app.post('/invoices/new/:id?', imports.posEmployees.checkEmployeeAuth, 
            main.Form.post(__dirname + "/newInvoice.html",'/invoices',{
                required : function(req,res){
                    return [
                        [req.body.name,"Name Must be Defined"],
                        [req.body.address,"Address Must be Defined"],
                        [req.body.city,"City Must be Defined"],
                        [req.body.state,"State Must be Defined"],
                        [req.body.zip,"Zip Must be Defined"],
                        [req.body.email,"Email Must be Defined"],
                        [req.body.phone,"Phone Must be Defined"]
                    ];
                },
                next : function(req,res,error,callback){
                    if(!error)
                    db.newCustomer(
                        req.body.name,
                        req.body.address,
                        req.body.city,
                        req.body.state,
                        req.body.zip,
                        req.body.email,
                        req.body.phone,
                        req.session.user,//whoCreated
                        function(err){
                            if(!err){
                                callback(null);
                            }else callback(err);
                        });
                    else callback();
                }
            }) );
    });
    
    register(null, {
        "posInvoices": {}
    });

};
