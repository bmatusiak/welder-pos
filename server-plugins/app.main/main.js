"use strict";

module.exports = function(options, imports, register) {
    
    var main = {
        welder:imports.welder,
        ejs:imports.ejs,
        Form:imports.Form,
        settings:imports.settings,
        dir:{
            template: __dirname+"/template"
        }
    };
    
    main.ejs.use(main.dir.template + "/parts");
    main.ejs.staticOption("main",main);
    
    imports.welder.addRequestParser(function(http){
        
        /*
        http.app.post('/login', function(req, res, next) {
            req.session.user = req.body.userlogin;
            res.redirect("/");
        });
        */
        http.app.use('/index.html', function(req, res, next) {
            res.redirect("/");
        });
        http.app.get('/', function(req, res, next) {
            var options = {
                req:req
            }
            function renderDashboard(){
                
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                main.ejs.renderFile(main.dir.template + "/daskboard.html",options,function(err,data){
                    res.end(data);
                }); 
            }
            if(!req.session.user){
                if(main.settings.isUsersSetup){
                    res.redirect("/login");
                    /*
                    res.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    main.ejs.renderFile(main.dir.template + "/login.html",{req:req},function(err,data){
                        res.end(data);
                    });
                    */
                }else{
                    res.redirect("/setup");
                }
            }else{
                if(!main.settings.isSetup){ 
                    res.redirect("/setup");
                }else{
                    main.welder.architect.services.posCustomers.db.customersPage(
                        req.query.page-1 || 0,50,
                        function(err,customers){
                                options.customers = customers.results;
                                renderDashboard();
                        });
                        
                    
                }
            }
        });
        
    });
    
    imports.welder.addStatic("/",__dirname+"/static",false);
    
    register(null, {
        "main": main
    });

};
