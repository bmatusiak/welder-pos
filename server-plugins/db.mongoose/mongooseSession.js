module.exports = function(Mongoose, Schema) {
    var Session, SessionSchema, _SessionStore, defaultCallback;
    var __hasProp = Object.prototype.hasOwnProperty,
        __extends = function(child, parent) {
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }

            function ctor() {
                this.constructor = child;
            }
            ctor.prototype = parent.prototype;
            child.prototype = new ctor();
            child.__super__ = parent.prototype;
            return child;
        };
    SessionSchema = new Schema({
        sid: {
            type: String,
            required: true,
            unique: true
        },
        uid: Number,
        data: {
            type: String,
            "default": '{}'
        },
        expires: {
            type: Date,
            index: true
        }
    });
    var SessionCollection = 'Session';
    Session = Mongoose.model(SessionCollection, SessionSchema);
    defaultCallback = function(err) {};
    _SessionStore = (function() {
        __extends(SessionStore, require('express/node_modules/connect').session.Store);

        function SessionStore(options) {
            var _ref;
            if (options !== null) {
                if ((_ref = options.interval) !== null) {
                    _ref;
                }
                else {
                    options.interval = 60000;
                }
            }
            
            Session.remove({//check for expired sessions on start!
                expires: {
                    '$lte': new Date()
                }
            }, defaultCallback);
            
            setInterval((function() {
                return Session.remove({
                    expires: {
                        '$lte': new Date()
                    }
                }, defaultCallback);
            }), options.interval);
        }
        SessionStore.prototype.SessionSchema = SessionSchema;
        SessionStore.prototype.SessionCollection = SessionCollection;
        SessionStore.prototype.get = function(sid, cb,callbackType) {
            if (cb === null) {
                cb = defaultCallback;
            }
            return Session.findOne({
                sid: sid
            }, function(err, session) {
                if(session && callbackType)callbackType(err, session);
                if (session !== null) {
                    try {
                        return cb(null, JSON.parse(session.data));
                    }
                    catch (err) {
                        return cb(err);
                    }
                }
                else {
                    return cb(err, session);
                }
            });
        };
        SessionStore.prototype.set = function(sid, Data, cb) {
            var _ref;
            if (cb === null) {
                cb = defaultCallback;
            }
            try {
                return Session.update({
                    sid: sid
                }, {
                    sid: sid,
                    uid: (Data && Data.auth && Data.auth.userId ? Data.auth.userId : 0),
                    data: JSON.stringify(Data),
                    expires: (Data !== null ? (_ref = Data.cookie) !== null ? _ref.expires : void 0 : void 0) !== null ? Data.cookie.expires : null
                }, {
                    upsert: true
                }, cb);
            }
            catch (err) {
                return cb(err);
            }
        };
        SessionStore.prototype.destroy = function(sid, cb) {
            if (cb === null) {
                cb = defaultCallback;
            }
            if(cb)
            Session.findOne({sid: sid}, function(err,session){
                if(session)
                    session.remove(cb);
                else
                    cb(err,session);
            });
            else
            return Session.remove({
                sid: sid
            }, cb);
        };
        SessionStore.prototype.all = function(cb) {
            if (cb === null) {
                cb = defaultCallback;
            }
            return Session.find({
                expires: {
                    '$gte': new Date()
                }
            }, ['sid'], function(err, sessions) {
                var session;
                if (sessions !== null) {
                    return cb(null, (function() {
                        var _i, _len, _results;
                        _results = [];
                        for (_i = 0, _len = sessions.length; _i < _len; _i++) {
                            session = sessions[_i];
                            _results.push(session.sid);
                        }
                        return _results;
                    })());
                }
                else {
                    return cb(err);
                }
            });
        };
        SessionStore.prototype.clear = function(cb) {
            if (cb === null) {
                cb = defaultCallback;
            }
            return Session.drop(cb);
        };
        SessionStore.prototype.length = function(cb) {
            if (cb === null) {
                cb = defaultCallback;
            }
            return Session.count({}, cb);
        };
        return SessionStore;
    })();
    return _SessionStore;
};