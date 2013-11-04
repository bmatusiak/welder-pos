define(function(require, exports, module) {
    return function() {
        var loadedCustomers = false,loadedInvoices = false;
        window.socket(function (socket) {
            if(!loadedCustomers)
            socket.emit("dashboard-customers",1,function(err,customers){
                loadedCustomers = true;
                for(var i in customers){
                    var template = [
                        '<div class="row-fluid">',
                            '<a href="/invoices/new/'+customers[i].id+'" class="pull-right" style="font-size:30px;padding-top: 7px;"><i class="icon-edit"></i></a>',
                            '<div class="pull-right" style="text-align:right;padding-right:10px;">',
                                customers[i].phone+"<br />",
                                customers[i].email,
                            '</div>',
                            '<div>',
                                customers[i].name+"<br />",
                                customers[i].id,
                            '</div>',
                        '</div>',
                        '<hr style="margin:5px 0px 5px 0px;" />'
                    ].join('');
                        
                    $(".customersList").prepend(template);
                    $(".loadingCustomersList").hide();
                }
            }); 
            
            if(!loadedInvoices)
            socket.emit("dashboard-invoices",1,function(err,invoices){
                loadedInvoices = true;
                for(var i in invoices){
                    var template = [
                        '<div class="row-fluid">',
                            '<a href="/invoices/'+invoices[i].id+'" class="pull-right" style="font-size:30px;padding-top: 7px;"><i class="icon-edit"></i></a>',
                            '<div class="pull-right" style="text-align:right;padding-right:10px;">',
                                invoices[i].price+"<br />",
                                invoices[i].created,
                            '</div>',
                            '<div>',
                                invoices[i].cid+"<br />",
                                invoices[i].id,
                            '</div>',
                        '</div>',
                        '<hr style="margin:5px 0px 5px 0px;" />'
                    ].join('');
                        
                    $(".invoicesList").prepend(template);
                    $(".loadingInvoicesList").hide();
                }
            }); 
        });
    };
});