"use strict";

module.exports = function(options, imports, register) {
    
    var pos = imports.pos;
    
    var db = require("./db.products.js")(pos.app.db);
    
    pos.app.menus.
    register("SUBNAV",{
        icon:"icon-tag",
        link:"/products",
        title:"Products",
        sort:3
    });
    
    register(null, {
        "products": {
            db:db,
            httpConnection:function(http){
                http.sub(pos.app.users.checkUserAuth()).get('/products', function(req, res, next) {
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
                
                http.sub(pos.app.users.checkUserAuth()).get('/products/:id',
                    function(req,res,next){
                        var id = req.params.id;
                        if(id === "new")
                            return next();
                            
                        db.getProduct({_id:id},function(err,product){
                            req.body = product || {error: err};
                            next();
                        });
                    },
                    pos.app.Form.get(__dirname + "/newProduct.html"));
                
                http.sub(pos.app.users.checkUserAuth()).post('/products/:id',
                    pos.app.Form.post(__dirname + "/newProduct.html",'/products',{
                        required : function(req,res){
                            return [
                                [req.body.name,"Name Must be Defined"],
                                [req.body.model,"Model Must be Defined"],
                                [req.body.stock,"Stock Must be Defined"],
                                [req.body.price,"Price Must be Defined"]
                            ];
                        },
                        next : function(req,res,error,callback){
                            var id = req.params.id;
                            if(id === "new")
                                if(!error){
                                    db.newProduct(
                                        req.body.name,
                                        req.body.model,
                                        req.body.price,
                                        req.body.stock,
                                        req.session.user,
                                        function(err){
                                            if(!err){
                                                callback(null);
                                            }else callback(err);
                                        });
                                }else{ callback(); }
                            else {
                                db.getProduct({_id:id},function(err,product){
                                    if(err) return callback(err);
                                    
                                    product.name = req.body.name,
                                    product.model = req.body.model,
                                    product.price = req.body.price,
                                    product.stock = req.body.stock,
                                    product.save(function(err){callback(err)});
                                });
                            }
                        }
                    }) 
                );
            }
        }
    });
};
