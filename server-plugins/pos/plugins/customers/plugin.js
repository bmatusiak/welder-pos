"use strict";

module.exports = function(options, imports, register) {

    var pos = imports.pos;

    var db = require("./db.customers.js")(pos.app.db);


    pos.app.menus.
    register("SUBNAV", {
        icon: "icon-user",
        link: "/customers",
        title: "Customers",
        sort: 1
    });

    register(null, {
        "customers": {
            db: db,
            elementsDir: __dirname + "/elements",
            settings: {
                customerTax: ["0.065", "Default Customer Tax"]
            },
            httpConnection: function(http) {

                http.get('/customers',
                    pos.app.users.checkUserAuth(),
                    function(req, res, next) {
                        db.customersPage(req.query.page - 1 || 0, 50,
                            function(err, customers) {
                                if (!err) {
                                    req.ejs(__dirname + "/customers.html", { customers: customers, settings: pos.app.settings });
                                }
                                else {
                                    req.ejs(pos.app.dir.template + "/error.html", { error: err });
                                }
                            });
                    });

                http.get('/customers/new',
                    pos.app.users.checkUserAuth(),
                    pos.app.Form.get(__dirname + "/newCustomer.html"));

                http.post('/customers/new',
                    pos.app.users.checkUserAuth(),
                    pos.app.Form.post(__dirname + "/newCustomer.html", {
                        required: function(req, res, callback) {
                            callback(null, [
                                [req.body.name, "Name Must be Defined"],
                                [req.body.address, "Address Must be Defined"],
                                [req.body.city, "City Must be Defined"],
                                [req.body.state, "State Must be Defined"],
                                [req.body.zip, "Zip Must be Defined"],
                                [req.body.email, "Email Must be Defined"],
                                [req.body.phone, "Phone Must be Defined"]
                            ]);
                        },
                        next: function(req, res, error, callback) {
                            if (!error)
                                db.newCustomer(
                                    req.body.name,
                                    req.body.address,
                                    req.body.city,
                                    req.body.state,
                                    req.body.zip,
                                    req.body.email,
                                    req.body.phone,
                                    req.session.user,
                                    function(err) {
                                        if (!err) {
                                            callback(null, "/customers");
                                        }
                                        else callback(err);
                                    });
                            else callback();
                        }
                    }));
                    
                ///////////////////////    
                http.get('/customers/edit/:id',
                    pos.app.users.checkUserAuth(),
                    pos.app.Form.get(__dirname + "/customer-edit.html",function(req,res,next){
                        //next(err,allow,templateData);
                        db.queryCustomer({_id:req.params.id},function(err,customer){
                            next(null,null,{customer:customer});    
                        })
                        
                    }));

                http.post('/customers/edit/:id',
                    pos.app.users.checkUserAuth(),
                    pos.app.Form.post(__dirname + "/customer-edit.html", {
                        required: function(req, res, callback) {
                            callback(null, [
                                [req.body.name, "Name Must be Defined"],
                                [req.body.address, "Address Must be Defined"],
                                [req.body.city, "City Must be Defined"],
                                [req.body.state, "State Must be Defined"],
                                [req.body.zip, "Zip Must be Defined"],
                                [req.body.email, "Email Must be Defined"],
                                [req.body.phone, "Phone Must be Defined"]
                            ]);
                        },
                        next: function(req, res, error, callback) {
                            if (!error)
                                db.editCustomer(req.params.id,req.body,
                                    function(customer) {
                                        if (!customer.errors) {
                                            callback(null, "/customers/edit/"+req.params.id);
                                        }
                                        else 
                                            callback(customer.errors);
                                    });
                            else callback();
                        }
                    }));
            }
        }
    });

};
