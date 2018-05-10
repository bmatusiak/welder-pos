"use strict";

module.exports = function(options, imports, register) {

    var pos = imports.pos;

    var db = require("./db.workorders.js")(pos.app.db);

    pos.app.menus.
    register("SUBNAV", {
        icon: "icon-file-alt",
        link: "/workorders",
        title: "Workorders",
        sort: 2
    });
    
    var workorderStatuses = [
        "New",
        "In Progress",
        "Waiting For Approval",
        "Waiting for Pickup/Delivery",
        "Important",
        "Completed"
    ];

    register(null, {
        "workorders": {
            db: db,
            moduleDir: __dirname + "/static",
            socketUserConnection: function(socket) {
                socket.on("workorder-save", function(workorderid, data, callback) {
                    db.getDoc({ workorderid: workorderid }, function(err, doc) {
                        doc.data = data.products;
                        doc.issueData = data.issue;
                        doc.workCompletedData = data.workComplete;
                        doc.status = data.status;
                        doc.save(function(err, doc) {
                            if (callback) callback(err, doc);
                        });
                    });
                });
                socket.on("workorder-load", function(workorderid, callback) {
                    db.getDoc({ workorderid: workorderid }, function(err, doc) {
                        if(!err)
                            doc._doc.workorderStatuses = workorderStatuses;
                        if (callback) callback(err, doc);
                    });
                });
                socket.on("workorder-calculate", function(docData, callback) {
                    callback(null, db.calcData(docData));
                });

                //************************ 
                socket.on("workorder-product-lookup", function(name, model, callback) {
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
                http.get('/workorders', pos.app.users.checkUserAuth(), function(req, res, next) {
                    db.pageDocs({ /*type: req.query.type || {'$ne': "draft" }*/ }, req.query.page - 1 || 0, 50,
                        function(err, docs) {
                            if (!err) {
                                req.ejs(__dirname + "/workorders-list.html", { pos: pos, docs: docs });
                            }
                            else {
                                req.ejs(pos.app.dir.template + "/error.html", { error: err });
                            }
                        });
                });
                //workorder actions, new, view, edit, void
                http.get('/workorders/:action/:workorderid?', pos.app.users.checkUserAuth(), function(req, res, next) {

                    switch (req.params.action) {
                        case 'new':
                            //if new "req.params.workorderid" should be customer hash
                            /*
                                Generate new workorder, then redirect to /edit/workorderid
                            */
                            db.newDoc({ data: {}, customer: req.params.workorderid }, req.session.user, function(err, doc) {
                                req.ejs(__dirname + "/workorders-new.html", { pos: pos, workorderid: doc.workorderid});
                            });

                            break;
                        case 'edit':
                            req.ejs(__dirname + "/workorders-edit.html", { pos: pos, workorderid: req.params.workorderid });
                            break;
                        case 'view':
                            req.ejs(__dirname + "/workorders-view.html", { pos: pos, workorderid: req.params.workorderid });
                            break;
                        case 'void':
                            req.ejs(__dirname + "/workorders-void.html", { pos: pos, workorderid: req.params.workorderid });
                            break;
                            
                        default:
                            req.ejs(pos.app.dir.template + "/error.html", { error: "Invalid Action" });
                    }

                });

            }
        }
    });

};
