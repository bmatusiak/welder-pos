"use strict";

module.exports = function(options, imports, register) {
    
    var main = imports.main;
    
    var pos  = {
            dashboard : imports.posDashboard,
            employees : imports.posEmployees,
            customers : imports.posCustomers,
            invoices : imports.posInvoices,
            products : imports.posProducts,
            settings : imports.posSettings,
            sockets : imports.posSockets
        };
    
    main.welder.addStaticFile("/static/modules/main.js",__dirname+"/client.main.js",false);
    
    for(var i in pos){
        if(pos[i].moduleDir){
            main.welder.addStatic("/static/modules/"+i,pos[i].moduleDir,false);
        }
        if(pos[i].socketConnection){
            pos.sockets.addSocketConnection(pos[i].socketConnection);
        }
        if(pos[i].httpConnection){
            imports.main.welder.addRequestParser(pos[i].httpConnection);
        }
    }
        
    register(null, {
        "pos": pos
    });
    
};
