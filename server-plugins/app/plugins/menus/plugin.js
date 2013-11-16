"use strict";

module.exports = function(options, imports, register) {
    
    var areas = {};
    
    var menusPlugin = {
            register:function(area,data){
                if(!areas[area]) areas[area] = [];
                    
                    areas[area].push(data);
                /* 
                    {
                        icon:"icon-home",
                        link:"/",
                        title:"Home",
                        permission:"user"
                    }   
                */
                return menusPlugin;
            },
            get:function(area,req){
                if(areas[area]){
                    var retData = [];
                    var data = areas[area]
                    data.forEach(function(it){
                        if(it.permission && req){
                            if(req.user.permissions[it.permission])
                            retData.push(it);
                        }else
                            retData.push(it);
                    })
                    retData.sort(function(d,b,c){
                        return d.sort - b.sort
                    });
                    return retData;
                }
                return [];
            }
        };
        
                    
    register(null,{
        "menus":menusPlugin
    });
};
                    