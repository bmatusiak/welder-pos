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
                        title:"Home"
                    }   
                */
                return menusPlugin;
            },
            get:function(area){
                if(areas[area]){
                    areas[area].sort(function(d,b,c){
                        return d.sort - b.sort
                    });
                    return areas[area];
                }
                return [];
            }
        };
        
                    
    register(null,{
        "menus":menusPlugin
    });
};
                    