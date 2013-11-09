"use strict";

module.exports = function(options, imports, register) {
    
    var pos = imports.pos;
    
    
    pos.app.menus.
    register("SUBNAV",{
        icon:"icon-home",
        link:"/",
        title:"Home"
    });
        
    register(null, {
        "dashboard": {
            moduleDir:__dirname+"/static",
            httpConnection:function(http){
                http.sub(pos.app.users.checkUserAuth()).get('/home', function(req, res, next) {
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
            socketUserConnection:function($socket){
                $socket.on('dashboard-customers',function(page,callback){
                    if(!callback && page && typeof(page) == "function")callback = page;
                    pos.customers.db.customersPage(page ? page-1 : 0 || 0,50,
                            function(err,customers){
                                callback(err,customers.results);
                            });
                });
                $socket.on('dashboard-invoices',function(page,callback){
                    if(!callback && page && typeof(page) == "function")callback = page;
                    pos.invoices.db.pageDocs({type: {'$ne': "draft" }},page ? page-1 : 0 || 0,50,
                        function(err,invoices){
                            callback(err,invoices.results);
                        });
                });
            }
        }
    });

};
