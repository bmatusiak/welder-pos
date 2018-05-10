define(function(require, exports, module) {
    return function() {
        var loadedworkorders = false;
        window.socket(function (socket) {
            
            if(!loadedworkorders)
            socket.emit("dashboard-workorders",1,function(err,workorders){
                loadedworkorders = true;
                for(var i in workorders){
                    var template = [
                        '<div class="row-fluid">',
                            '<a href="/workorders/'+workorders[i]._id+'" class="pull-right" style="font-size:30px;padding-top: 7px;"><i class="icon-edit"></i></a>',
                            '<div class="pull-right" style="text-align:right;padding-right:10px;">',
                                workorders[i].data.total+"<br />",
                                workorders[i].created,
                            '</div>',
                            '<div>',
                                workorders[i].customer.name+"<br />",
                                workorders[i].type + " : " + workorders[i]._id,
                            '</div>',
                        '</div>',
                        '<hr style="margin:5px 0px 5px 0px;" />'
                    ].join('');
                        
                    $(".workordersList").prepend(template);
                    $(".loadingworkordersList").hide();
                }
            }); 
        });
    };
});