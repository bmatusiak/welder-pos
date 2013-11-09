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
                if(areas[area])
                    return areas[area];
                
                return [];
            }
        };
        
        menusPlugin.
        register("SUBNAV",{
            icon:"icon-home",
            link:"/",
            title:"Home"
        });
                    
    register(null,{
        "menus":menusPlugin
    });
};
                    