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
                                req.ejs(__dirname + "/products.html",{products:products,settings:pos.app.settings});
                            }else {
                                req.ejs(pos.app.dir.template + "/error.html",{error:err});
                            }
                        });
                });
                
                http.sub(pos.app.users.checkUserAuth()).get('/products/:id',
                    function(req,res,next){
                        var id = req.params.id;
                        if(id === "new")
                            return next();
                            
                        db.getProduct({uid:id},function(err,product){
                            req.body = product || {error: err};
                            next();
                        });
                    },
                    pos.app.Form.get(__dirname + "/newProduct.html"));
                
                http.sub(pos.app.users.checkUserAuth()).post('/products/:id',
                    pos.app.Form.post(__dirname + "/newProduct.html",{
                        required : function(req,res,callback){
                            callback(null,[
                                [req.body.name,"Name Must be Defined"],
                                [req.body.model,"Model Must be Defined"],
                                [req.body.stock,"Stock Must be Defined"],
                                [req.body.price,"Price Must be Defined"]
                            ]);
                        },
                        next : function(req,res,error,callback){
                            var id = req.params.id;
                            var done = function(err){
                                if(!err){
                                    callback(null,'/products');
                                }else callback(err);
                            };
                            if(id === "new")
                                if(!error){
                                    db.newProduct(
                                        req.body.name,
                                        req.body.model,
                                        req.body.price,
                                        req.body.stock,
                                        req.session.user,
                                        done);
                                }else{ callback(); }
                            else {
                                db.getProduct({uid:id},function(err,product){
                                    if(err) return callback(err);
                                    
                                    product.name = req.body.name,
                                    product.model = req.body.model,
                                    product.price = req.body.price,
                                    product.stock = req.body.stock,
                                    product.save(done);
                                });
                            }
                        }
                    }) 
                );
            }
        }
    });
};
