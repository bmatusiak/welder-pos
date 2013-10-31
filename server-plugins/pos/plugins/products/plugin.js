"use strict";

module.exports = function(options, imports, register) {
    
    var pos = imports.pos;
    
    var db = require("./db.products.js")(pos.app.db);
    
    register(null, {
        "products": {
            httpConnection:function(http){
                http.get('/products', pos.app.users.checkUserAuth(), function(req, res, next) {
                    db.productsPage(req.query.page-1 || 0,50,
                        function(err,products){
                            if(!err){
                                res.writeHead(200, {
                                    'Content-Type': 'text/html'
                                });
                                pos.app.ejs.renderFile(__dirname + "/products.html",{products:products,req:req,settings:pos.app.settings},function(err,data){
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
                
                http.get('/products/new/:id?',
                    pos.app.users.checkUserAuth(), 
                    pos.app.Form.get(__dirname + "/newProduct.html"));
                
                http.post('/products/new/:id?', pos.app.users.checkUserAuth(), 
                    pos.app.Form.post(__dirname + "/newProduct.html",'/products',{
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
                    }) 
                );
            }
        }
    });
};
