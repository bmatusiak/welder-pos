"use strict";

module.exports = function(options, imports, register) {

    var users = imports.users;
    var app = users.app;
    var db = users.db;
    
    register(null, {
        "routes": {
            init: function() {
                app.welder.addMiddleWare(function(http) {
                    http.use(function(req, res, next) {
                        if (!app.settings.isUsersSetup && req.url !== "/setup") {
                            return res.redirect("/setup");
                        }
                        if (req.session.user && !req.user) {
                            db.getUser(req.session.user, function(err, user) {
                                if (!err && user) req.user = user;
                                next();
                            });
                        }
                        else next();
                    });
                });
                app.welder.addRequestParser(function(http) {
                    http.get("/user", function(req, res, next) {
                        res.redirect("/user/" + req.session.user);
                    });
                    http.get("/user/:id", users.checkUserAuth(),
                    app.Form.get(users.pages.user, function(req, res, callback) {
                        var permissions = users.permissions.get();
                        if (req.params.id == "new") {
                            users.checkUserAuth(null, "add_users")(req, res, function() {
                                callback();
                            });
                        }
                        else db.getUser(req.params.id, function(err, user) {
                            req.data = {
                                id: req.params.id,
                                user: user,
                                permissions: permissions
                            };
                            callback();
                        });
                        return true;
                    }));
                    http.post("/user/:id", users.checkUserAuth(),
                    app.Form.post(users.pages.user, { //req.body.formid
                        allow: function(req, res, callback) {
                            if (req.params.id === "new") {
                                users.checkUserAuth(null, "add_users")(req, res, function() {
                                    callback();
                                });
                            }
                            else callback();
                        },
                        required: function(req, res, next) {
                            if (req.params.id === "new") {
                                next(null, [
                                    [req.body.username, "Users Name must be defined"],
                                    [req.body.password && req.body.password2 && req.body.password == req.body.password2, "Password & Password Confirm Must Match"],
                                    [req.body.userlogin, "User Login mus be defined"]
                                ]);
                            }
                            else next(null, [
                                [req.params.id, "UserID Must be Defined"],
                                [(req.body.password && req.body.password2) ? req.body.password == req.body.password2 : true, "Password & Password Confirm Must Match"], ]);
                        },
                        next: function(req, res, error, callback) { //next is required in this object
                            if (!error) if (req.params.id === "new") {
                                users.addUser(req.body.username, req.body.userlogin, req.body.password, req.body.useremail, req.user.userlogin, function(err) {
                                    if (!err) {

                                        res.redirect("/user/" + req.body.userlogin);
                                    }
                                    else callback(err);
                                });
                            }
                            else db.getUser(req.params.id, function(err, user) {
                                if (err) return callback(err);
                                if (req.body.password && req.body.password2) user.userpass = req.body.password;
                                var userPerm = user.permissions;
                                var permissions = users.permissions.get();
                                for (var i in permissions) {
                                    if (req.body["permission_" + i]) {
                                        userPerm[i] = true;
                                    }
                                    else {
                                        userPerm[i] = false;
                                    }
                                }
                                user.permissions = userPerm;
                                user.save(function(err) {
                                    callback(err);
                                });
                            });
                            else {
                                var permissions = users.permissions.get();
                                if (req.params.id === "new") {
                                    callback();
                                }
                                else db.getUser(req.params.id, function(err, user) {
                                    req.data = {
                                        id: req.params.id,
                                        user: user,
                                        permissions: permissions
                                    };
                                    callback();
                                });
                            }
                        }
                    }));
                    http.use("/logout", function(req, res, next) {
                        delete req.session.user;
                        res.redirect("/");
                    });
                    http.get("/login", app.Form.get(users.pages.login, function(req, res, callback) {
                        callback(req.session.user || !app.settings.isUsersSetup && req.session.user, "/");
                    }));
                    http.post("/login", app.Form.post(users.pages.login, {
                        allow: function(req, res, next) {
                            next(null, true);
                        },
                        required: function(req, res, next) {
                            next(null, [
                                [req.body.userlogin, "UserLogin Must be Defined"],
                                [req.body.password, "Password Must be Defined"], ]);
                        },
                        next: function(req, res, error, callback) {
                            if (!error) db.auth(req.body.userlogin, req.body.password, function(err, user, reason) {
                                if (!err) {
                                    app.Form.condition([
                                        [user, "Failed to Login!"]
                                    ], function(err, errStr) {
                                        if (!err) {
                                            req.session.user = user.userlogin;
                                            callback(null, req.query.path);
                                        }
                                        else callback(errStr);
                                    });
                                }
                                else callback(err);
                            });
                            else callback();
                        }
                    }));
                });
            }
        }
    });

};
