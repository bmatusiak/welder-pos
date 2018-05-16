"use strict";

module.exports = function(options, imports, register) {

    var pos = imports.pos;

    var Promise = require("promise");

    var customerPreData = require("./demoData/customer-names.js");
    customerPreData.citiesStates = require("./demoData/cities-states.js");
    customerPreData.streets = require("./demoData/streets.js");
    
    var productNames = require("./demoData/product-names.js");

    function buildCustomer() {
        function rn() { return Math.floor(Math.random() * 10); }
        var streetPrefix = (Math.floor(Math.random() * 10) + 1) + "" + Math.floor(Math.random() * 10) + "" + Math.floor(Math.random() * 10);
        var phone = rn() + "" + rn() + "" + rn() + "-" + rn() + "" + rn() + "" + rn() + "-" + rn() + "" + rn() + "" + rn() + "" + rn();
        
        var firstName = customerPreData.firstNames[Math.floor(Math.random() * customerPreData.firstNames.length)];
        var lastName = customerPreData.lastNames[Math.floor(Math.random() * customerPreData.lastNames.length)];
        var fullname = firstName + " " + lastName;
        var email = firstName + lastName + streetPrefix+"@example.com";
        
        var street = customerPreData.streets[Math.floor(Math.random() * customerPreData.streets.length)];
        var fullSteet = streetPrefix + " " + street;
        var zip = (Math.floor(Math.random() * 9) + 1) + "" + Math.floor(Math.random() * 10) + "" + Math.floor(Math.random() * 10) + "" + Math.floor(Math.random() * 10) + "" + Math.floor(Math.random() * 10);
        
        var cityState = customerPreData.citiesStates[Math.floor(Math.random() * customerPreData.citiesStates.length)]
        var city = cityState.city;
        var state = cityState.state;
        
        return { name: fullname, phone: phone, address: fullSteet, city: city, state: state, zip: zip, email: email };
    }

    var productCount = 0;

    function buildProduct() {
        var prod = {};

        prod.name = productNames[Math.floor(Math.random() * productNames.length)];
        prod.model = (productCount++) + "-demo-" + prod.name + "-" + (new Date()).getTime();
        prod.price = Math.floor(Math.random() * 500) + "." + Math.floor(Math.random() * 99);
        prod.stock = -1
        prod.createdBy = "demo"

        return prod;
    }

    function buildWorkorder(customerid) {

        var workorderStatuses = [
            "New",
            "In Progress",
            "Waiting For Approval",
            "Waiting for Pickup/Delivery",
            "Important",
            "Completed"
        ];

        var workorder = {};

        workorder.customer = customerid;
        workorder.data = {};
        workorder.status = workorderStatuses[Math.floor(Math.random() * workorderStatuses.length)];
        workorder.whoCreatedLogin = "demo";

        return workorder;
    }

    pos.app.menus.
    register("USERDROPDOWN", {
        link: "/demo",
        title: "Demo Setup",
        sort: 10000
    });

    register(null, {
        "demo": {
            moduleDir: __dirname + "/static",
            httpConnection: function(http) {
                http.get('/demo', pos.app.users.checkUserAuth(), function(req, res, next) {
                    req.ejs(__dirname + "/demo.html", { pos: pos });
                });

                http.get('/demo/loadData', pos.app.users.checkUserAuth(), function(req, res, next) {


                    //add customer

                    //add products
                    function buildProducts(count) {

                        function makeProduct() {
                            return new Promise(function(fulfill, reject) {
                                var prod = buildProduct();
                                pos.products.db.newProduct(prod.name, prod.model, prod.price, prod.stock, prod.createdBy, function(err, product) {
                                    if (err) reject(err);
                                    else fulfill(res);
                                });
                            });
                        }

                        var prodd = makeProduct()
                        for (var i = 0; i < count; i++) {
                            prodd = prodd.then(makeProduct);
                        }

                        return prodd;
                    }
                    //add workorders

                    //add invoices

                    //generate invoces from workorders

                    function buildCustomers(count) {

                        function makeCustomer() {
                            return new Promise(function(fulfill, reject) {

                                var customer = buildCustomer();

                                pos.customers.db.newCustomer(
                                    customer.name,
                                    customer.address,
                                    customer.city,
                                    customer.state,
                                    customer.zip,
                                    customer.email,
                                    customer.phone,
                                    "demo",
                                    function(err, customer) {


                                        if (err) reject(err);
                                        else fulfill(res);


                                    })

                            });
                        }

                        var custd = makeCustomer()
                        for (var i = 0; i < count; i++) {
                            custd = custd.then(makeCustomer);
                        }

                        return custd;
                    }



                    function buildWorkorders($count,$done) {

                        function makeWorkorder() {
                            return new Promise(function(fulfill, reject) {
                                pos.app.db.counter.currentCount("Customers", function(err, count) {
                                    count = count - 1000;
                                    var cuid = Math.floor(Math.random() * count) + 1000;

                                    pos.customers.db.getCustomer(cuid, function(err, customer) {
                                        var workorder = buildWorkorder(customer._id);

                                        pos.workorders.db.newDoc(workorder, workorder.whoCreatedLogin, function(err, workorder) {

                                            if (err) reject(err);
                                            else fulfill(res);
                                        })
                                    })
                                })

                            });
                        }
                        
                        var $$count = 0;
                        var countLoop = function(){
                            $$count++
                            
                            if($$count > $count)
                                $done();
                            else
                                makeWorkorder().done(countLoop);
                        }
                        
                        countLoop();
                        
                    }


                    buildProducts(50).done(function() {
                        
                         buildCustomers(50).done(function(){
                            
                            buildWorkorders(50,done);
                        })
                    })


                    function done() {
                        res.redirect("/demo");
                    }
                });


            },
            socketUserConnection: function($socket) {

            }
        }
    });

};
