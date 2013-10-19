"use strict";

module.exports = function(options, imports, register) {
    
    var main = imports.main;
    
    main.welder.addRequestParser(function(http){
        
        http.app.get('/dashboard', function(req, res, next) {
            var options = {
                req:req
            }
            function renderDashboard(){
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                main.ejs.renderFile(__dirname + "/dashboard.html",options,function(err,data){
                    res.end(data);
                }); 
            }
            
            main.welder.architect.services.posCustomers.db.customersPage(
                req.query.page-1 || 0,50,
                function(err,customers){
                    options.customers = customers.results;
                    renderDashboard();
                });
        });
    });
    
    var socketio = imports.socketio;
    
    socketio.on("connection",function(socket){
        socket.on('dashboard-customers',function(page,callback){
            if(!callback && page && typeof(page) == "function")callback = page;
            main.welder.architect.services.posCustomers.db.customersPage(
                    page ? page-1 : 0 || 0,50,
                    function(err,customers){
                        callback(err,customers.results);
                    });
            
        });
    });
    
    register(null, {
        "posDashboard": {}
    });

};
