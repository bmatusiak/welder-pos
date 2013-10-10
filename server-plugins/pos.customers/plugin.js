"use strict";

module.exports = function(options, imports, register) {
    
    var main = imports.main;
    
    var db = require("./db.customers.js")(imports["db-mongoose"]);
    
    imports.main.welder.addRequestParser(function(http){
        
        http.app.get('/customers', imports.posEmployees.checkEmployeeAuth, function(req, res, next) {
            db.customersPage(req.query.page-1 || 0,50,
                function(err,customers){
                    if(!err){
                        res.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
                        main.ejs.renderFile(__dirname + "/customers.html",{customers:customers,req:req,settings:main.settings},function(err,data){
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
        
        http.app.get('/customers/new',
            imports.posEmployees.checkEmployeeAuth, 
            main.Form.get(__dirname + "/newCustomer.html"));
        
        http.app.post('/customers/new', imports.posEmployees.checkEmployeeAuth, 
            main.Form.post(__dirname + "/newCustomer.html",'/customers',{
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
                        req.session.user,
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
        "posCustomers": {db:db}
    });

};
