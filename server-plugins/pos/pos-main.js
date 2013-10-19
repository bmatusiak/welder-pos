"use strict";

module.exports = function(options, imports, register) {
    var pos  = {
            dashboard : imports.posDashboard,
            employees : imports.posEmployees,
            customers : imports.posCustomers,
            invoices : imports.posInvoices,
            products : imports.posProducts,
            settings : imports.posSettings
        }
    register(null, {
        "pos": pos
    });
    
};
