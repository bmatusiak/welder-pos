"use strict";

module.exports = function(options, imports, register) {

    var pos = imports.pos;

    var db = require("./db.invoices.js")(pos.app.db);

    pos.app.menus.
    register("SUBNAV", {
        icon: "icon-file",
        link: "/invoices",
        title: "Invoices",
        sort: 2
    });

    register(null, {
        "invoices": {
            db: db,
            moduleDir: __dirname + "/static",
            socketUserConnection: function(socket) {
                socket.on("invoice-save", function(invoiceid, docData, callback) {
                    db.getDoc({ invoiceid: invoiceid }, function(err, doc) {
                        doc.data = docData;
                        doc.save(function(err, doc) {
                            if (callback) callback(err, doc);
                        });
                    });
                });
                socket.on("invoice-load", function(invoiceid, callback) {
                    db.getDoc({ invoiceid: invoiceid }, function(err, doc) {
                        if (callback) callback(err, doc);
                    });
                });
                socket.on("invoice-calculate", function(docData, callback) {
                    callback(null, db.calcData(docData));
                });

                //************************ 
                socket.on("invoice-product-lookup", function(name, model, callback) {
                    var query = {};
                    if (name) {
                        query.name = new RegExp(name.split(" ").join("|"), "gi");
                    }
                    if (model)
                        query.model = model;

                    pos.products.db.listProducts(query, function(err, data) {
                        if (callback) callback(err, data);
                    });
                });
            },
            httpConnection: function(http) {
                //list newist invocies
                http.get('/invoices', pos.app.users.checkUserAuth(), function(req, res, next) {
                    db.pageDocs({ /*type: req.query.type || {'$ne': "draft" }*/ }, req.query.page - 1 || 0, 2,
                        function(err, docs) {
                            if (!err) {
                                req.ejs(__dirname + "/invoices.html", { pos: pos, docs: docs });
                            }
                            else {
                                req.ejs(pos.app.dir.template + "/error.html", { error: err });
                            }
                        });
                });
                //invoice actions, new, view, edit, void
                http.get('/invoices/:action/:invoiceid?', pos.app.users.checkUserAuth(), function(req, res, next) {

                    switch (req.params.action) {
                        case 'new':
                            //if new "req.params.invoiceid" should be customer hash
                            /*
                                Generate new invoice, then redirect to /edit/invoiceid
                            */
                            db.newDoc({ data: {}, customer: req.params.invoiceid }, req.session.user, function(err, doc) {
                                req.ejs(__dirname + "/invoice-new.html", { pos: pos, invoiceid: doc.invoiceid });
                            });

                            break;
                        case 'edit':
                            req.ejs(__dirname + "/invoice-edit.html", { pos: pos, invoiceid: req.params.invoiceid });
                            break;
                        case 'view':
                            req.ejs(__dirname + "/invoice-view.html", { pos: pos, invoiceid: req.params.invoiceid });
                            break;
                        case 'void':
                            req.ejs(__dirname + "/invoice-void.html", { pos: pos, invoiceid: req.params.invoiceid });
                            break;
                            
                        default:
                            req.ejs(pos.app.dir.template + "/error.html", { error: "Invalid Action" });
                    }

                });

            }
        }
    });

};
