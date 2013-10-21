define(function(require, exports, module) {
    return function() {
        var loadedCustomers = false;
        window.socket(function (socket) {
            if(!loadedCustomers)
            socket.emit("dashboard-customers",1,function(err,customers){
                loadedCustomers = true;
                for(var i in customers){
                    var template = '<tr>'
                        +'<td>'+customers[i].id+'</td>'
                        +'<td>'+customers[i].name+'</td>'
                        +'<td>'+customers[i].phone+'</td>'
                        +'<td>'+customers[i].email+'</td>'
                        +'<td style="text-align:center;font-size:30px;"><a href="/invoices/new/'+customers[i].id+'"><i class="icon-plus-sign-alt"></i></a></td>'
                        +'</tr>';
                    $(".customersList").prepend(template);
                    $(".loadingCustomersList").hide();
                }
            }); 
        });
    };
});