"use strict";

module.exports = function(options, imports, register) {
    
    var pos = imports.pos;
    
    register(null, {
        "demo": {
            moduleDir:__dirname+"/static",
            httpConnection:function(http){
                
            },
            socketUserConnection:function($socket){
                $socket.on('dashboard-customers',function(page,callback){
                    if(!callback && page && typeof(page) == "function")callback = page;
                    pos.customers.db.customersPage(page ? page-1 : 0 || 0,50,
                            function(err,customers){
                                callback(err,customers.results);
                            });
                });
            }
        }
    });

};
