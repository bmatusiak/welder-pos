"use strict";

module.exports = function(options, imports, register) {
    
    var pos = imports.pos;
    
    register(null, {
        "dashboard": {
            moduleDir:__dirname+"/static",
            httpConnection:function(http){
                http.app.get('/home',pos.app.users.checkUserAuth, function(req, res, next) {
                    var options = {
                        req:req
                    };
                    function renderDashboard(){
                        res.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
                        pos.app.ejs.renderFile(__dirname + "/dashboard.html",options,function(err,data){
                            res.end(data);
                        }); 
                    }
                    
                    renderDashboard();
                });
            },
            socketConnection:function(socket){
                socket.on('dashboard-customers',function(page,callback){
                    if(!callback && page && typeof(page) == "function")callback = page;
                    pos.customers.db.customersPage(
                            page ? page-1 : 0 || 0,50,
                            function(err,customers){
                                callback(err,customers.results);
                            });
                    
                });
            }
        }
    });

};
