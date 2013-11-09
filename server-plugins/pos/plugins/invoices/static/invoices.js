define(function(require, exports, module) {
    var nextUnitID = 0;
    
    function confirm(title,body,callback){
        var template = [
            '<div class="modal fade" role="dialog"><div class="modal-header"><h3>',
            title,
            '</h3></div><div class="modal-body"><p>',
            body,
            '</p></div><div class="modal-footer"><button class="btn" data-dismiss="modal">Cancel</button><button class="btn btn-primary confirm">Confirm</button></div></div>'
            ].join('');
            
        var dialog = $(template);
            dialog.find(".confirm").click(function(){
                callback(function close(){
                    dialog.modal('hide');
                });
            });
            dialog.modal();
    }
    /*
    confirm("test","body",function(){
        console.log("confirmed");
    });
      */      
    function invoiceTypeFNSetup(type,socket){
        var obj = {};
        if(type !== "invoice"){
            obj.createUnit = function(id){
               var template = '<tr class="unit">'
                            +'<td class="productNameRow">'
                            +'<a class="trash btn btn-small" href="javascript:"><i class="icon-trash"></i></a> &nbsp; &nbsp;<input style="width:35px" value="1"  class="productQuanity" />&nbsp;x&nbsp;<input class="productName" /> <a class="addAttribute btn btn-small"  href="javascript:"><i class="icon-plus"></i></a>'
                            +'</td>'
                            +'<td class="productModelRow"><input class="productModel" /></td>'
                            +'<td><input class="productPrice" value="0.00" /></td>'
                            +'<td class="price"></td>'
                            +'<td class="tax"></td>'
                            +'<td class="tprice"></td>'
                            +'</tr>';
                var row = $(template);
                var unit = row.closest(".unit");
                unit.attr("unitid",id);
                $(".unit-container").find(".unitsbottomRow").before(unit);
                
                unit.find(".productName").autocomplete({
                    close: function( event, ui ) {
                        $(event.target).change();
                        //console.log("autocompleate close")
                    },
                    focus: function( event, ui ){
                        var unit = $(event.target).closest(".unit").length ? $(event.target).closest(".unit") : $(event.target).closest(".unitAttribute").length ?  $(event.target).closest(".unitAttribute") : false;
                        var item = ui.item;
                        //unit.find(".productName").val(item.label);
                        unit.find(".productModel").val(item.model);
                        unit.find(".productPrice").val(item.price);
                        
                    },
                    select: function( event, ui ) {
                        //event.preventDefault();
                        var unit = $(event.target).closest(".unit").length ? $(event.target).closest(".unit") : $(event.target).closest(".unitAttribute").length ?  $(event.target).closest(".unitAttribute") : false;
                        var item = ui.item;
                        //unit.find(".productName").val(item.label);
                        unit.find(".productModel").val(item.model);
                        unit.find(".productPrice").val(item.price);
                        
                    },
                    autoFocus: true,
                    source : function(req,res){
                        socket.emit("invoice-product-lookup",req.term,null,function(err,products){
                            var dataA = [];
                            for (var i=0;i<products.length;i++){
                                products[i].label = products[i].name;
                                dataA.push(products[i]);
                            }
                            res(dataA);
                        });
                    }
                }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
                    return $( "<li>" )
                        .append( "<a>" + item.label + "<span class='pull-right'>" + item.price + "</span></a>" )
                        .appendTo( ul );
                };
            
                return unit;
            };
            obj.createUnitAtribute = function(unit,id){
                var templateAtribute = '<tr class="unitAttribute">'
                            +'<td class="productNameRow">'
                            +'<a class="trash btn btn-small" href="javascript:"><i class="icon-trash"></i></a> &nbsp; &nbsp; <i class="icon-share-alt rotate-share-alt"></i> &nbsp; &nbsp; <input style="width:35px" value="1"  class="productQuanity" />&nbsp;x&nbsp;<input class="productName" />'
                            +'</td>'
                            +'<td class="productModelRow"><input class="productModel" /></td>'
                            +'<td><input class="productPrice" value="0.00" /></td>'
                            +'<td><i class="icon-level-up rotate"></i></td>'
                            +'<td><i class="icon-level-up rotate"></i></td>'
                            +'<td><i class="icon-level-up rotate"></i></td>'
                            +'</tr>';
                var row = $(templateAtribute);
                var unitAtribute = row.closest(".unitAttribute");
                unitAtribute.attr("unitid",id);
                unitAtribute.attr("unitid-parent",unit.attr("unitid"));
                unit.after(unitAtribute);
                
                return unitAtribute;
            };
        }else{
            obj.createUnit = function(id){
                var template = '<tr class="unit">'
                            +'<td class="productNameRow">'
                            +'<span style="width:35px" value="1"  class="productQuanity"></span>&nbsp;x&nbsp;<span class="productName" ></span>'
                            +'</td>'
                            +'<td class="productModelRow"><span class="productModel"></span></td>'
                            +'<td><span class="productPrice"></span></td>'
                            +'<td class="price"></td>'
                            +'<td class="tax"></td>'
                            +'<td class="tprice"></td>'
                            +'</tr>';
                var row = $(template);
                var unit = row.closest(".unit");
                unit.attr("unitid",id);
                $(".unit-container").find(".unitsbottomRow").before(unit);
                return unit;
            };
            obj.createUnitAtribute = function(unit,id){
                var templateAtribute = '<tr class="unitAttribute">'
                            +'<td class="productNameRow">'
                            +'<span style="width:35px" value="1"  class="productQuanity"></span>&nbsp;x&nbsp;<span class="productName" ></span>'
                            +'</td>'
                            +'<td class="productModelRow"><span class="productModel"></span></td>'
                            +'<td><span class="productPrice"></span></td>'
                            +'<td><i class="icon-level-up rotate"></i></td>'
                            +'<td><i class="icon-level-up rotate"></i></td>'
                            +'<td><i class="icon-level-up rotate"></i></td>'
                            +'</tr>';
                    var row = $(templateAtribute);
                    var unitAtribute = row.closest(".unitAttribute");
                    unit.after(unitAtribute);
                return unitAtribute;
            };
        }
        
        
        return obj;
    }

    return function(docData) {
        //events are plugin.on() plugin.on() plugin.on() 
        
        var plugin = this;
        var loaded = false;
        plugin.on("loaded",function(){
            loaded = true;
            console.log("invoices loaded");
        });
        window.socket(function (socket) {
            var actions = invoiceTypeFNSetup(docData.type,socket);
            
            var customerID = docData.customerid;
            
            $(document).on('click','.addAttribute',function(){
                var unit = $(this).closest(".unit");
                actions.createUnitAtribute(unit,++nextUnitID);
                autoSaveDoc();
            });
            
            $(document).on('click','a.trash',function(){
                var unit = $(this).closest(".unit").length ? $(this).closest(".unit") : $(this).closest(".unitAttribute").length ?  $(this).closest(".unitAttribute") : false;
                    
                var unitIDparent = unit.attr("unitid-parent");
                if(!unitIDparent){
                    $("[unitid-parent='"+unit.attr("unitid")+"']").remove();
                } 
                    
                unit.remove();
                autoSaveDoc();
            });
            $(document).on('change','input',function(){
                var unit = $(this).closest(".unit").length ? $(this).closest(".unit") : $(this).closest(".unitAttribute").length ?  $(this).closest(".unitAttribute") : false;
                
                autoSaveDoc();
            });
            $(document).on('keyup','input',function(){
                var unit = $(this).closest(".unit").length ? $(this).closest(".unit") : $(this).closest(".unitAttribute").length ?  $(this).closest(".unitAttribute") : false;
                
                autoSaveDoc();
            });
            $(document).find(".openInvoiceBtn").click(function(){
                $(".btn").addClass("disabled");
                $("input").attr("readonly","readonly");
                saveDoc(function(err,doc){
                    socket.emit("invoice-new",doc,function(err,newDoc){
                        if(doc.type == "draft")
                            clearDoc(function(){
                                document.location = "/invoices/"+newDoc._id;    
                            });
                        else    
                            document.location = "/invoices/"+newDoc._id;
                    });
                });
            });
            function clearDoc(callback){
                $("tr[unitid]").remove();
                nextUnitID = 0;
                //updateMainTotals();
                saveDoc(callback);
            }
            $(document).find(".trashDraftBtn").click(function(){
                $("tr[unitid]").remove();
                nextUnitID = 0;
                autoSaveDoc();
            });
            $("#addBlank").click(function(){
                actions.createUnit(++nextUnitID);
                autoSaveDoc();
            });
            
            function setValue(ele,value){
                if(ele[0] && ele[0].tagName == "INPUT"){
                    ele.val(value);
                }else ele.text(value);
            }
            function getValue(ele){
                if(ele[0] && ele[0].tagName == "INPUT"){
                    return ele.val();
                }else return ele.text();
            }
            
            if(!loaded){
                socket.emit("invoice-load",docData.docid,function(err,doc){
                    if(doc.data.nextUnitID)
                        nextUnitID = doc.data.nextUnitID;
                    
                    for(var i in doc.data){
                        var unitData = doc.data[i];
                        if(typeof unitData !== "object") continue;
                        var unit = actions.createUnit(i);
                        setValue(unit.find(".productQuanity"),unitData.productQuanity);
                        setValue(unit.find(".productName"),unitData.productName);
                        setValue(unit.find(".productModel"),unitData.productModel);
                        setValue(unit.find(".productPrice"),unitData.productPrice);
                        for(var j in unitData.attribute){
                            var unitAtribute = actions.createUnitAtribute(unit,j);
                            setValue( unitAtribute.find(".productQuanity"),unitData.attribute[j].productQuanity);
                            setValue( unitAtribute.find(".productName"),unitData.attribute[j].productName);
                            setValue( unitAtribute.find(".productModel"),unitData.attribute[j].productModel);
                            setValue( unitAtribute.find(".productPrice"),unitData.attribute[j].productPrice);
                        } 
                        
                        unit.find(".price").text(unitData.price.toFixed(2));
                        unit.find(".tax").text(unitData.tax.toFixed(2));
                        unit.find(".tprice").text(unitData.total.toFixed(2));
                    }
                    
                    $(".sub-total").text(doc.data.stotal.toFixed(2));
                    $(".ttax").text(doc.data.ttotal.toFixed(2));
                    $(".total").text(doc.data.total.toFixed(2));
                
                    loaded = true;
                    plugin.emit("loaded");
                    
                    $("#loadingUnits").hide();
                    $(".onInvoiceLoad,.producttable").show();
                    if(docData.type == "invoice") $(".unitsbottomRow").hide();
                }); 
            }
            
            var saveIcon = $(".saveDocBtn");
            var unsaved = false;
            function autoSaveDoc(){
                if(docData.type == "draft")
                    return saveDoc();
                
                unsaved = true;
                saveIcon.find("span").text("UnSaved!");
                saveIcon.removeClass("btn-success").addClass("btn-danger");
                socket.emit("invoice-calculate",getData(),function(err,calculatedData){
                    setCalculations(calculatedData);
                });
            }
            $(document).on('click',".saveDocBtn",function(e){
                if(unsaved)
                confirm("Save Document","Are you sure you want to save this document?",function(close){
                    saveDoc(function(){
                        unsaved = false;
                        close();
                    });
                });
            });
                    
            var saving = false;
            var savingketchup = [];
            function saveDoc(callback){
                if(docData.type == "invoice") return;
                if(!loaded || saving){ 
                    if(saving){
                        if(callback)
                        savingketchup.push(callback)
                        /*
                        setTimeout(function() {
                            saveDoc(callback);
                        }, 1000);*/
                    }    
                return;}
                saving = true;
                var saveIcon = $(".saveDocBtn");
                saveIcon.removeClass("btn-danger").removeClass("btn-success").addClass("btn-warning").addClass("disabled");
                
                var draftObject = getData();
                
                socket.emit("invoice-save",docData.docid,draftObject,function(err,doc){
                    saving = false;
                    saveIcon.removeClass("btn-danger").removeClass("btn-warning").removeClass("disabled").addClass("btn-success");
                    saveIcon.find("span").text("Saved!");
                    
                    setCalculations(doc.data);
                    
                    if(callback) callback(null,doc);
                    
                    for (var j = 0; j < savingketchup.length; j++) {
                        savingketchup[j].call({},null,doc);
                    }
                    savingketchup = [];
                }); 
            }
            
            function getData(){
                var data = {nextUnitID:nextUnitID};
                $(".unit").each(function(k,value){
                    var unit = $(value);
                    var draftUnit = data[unit.attr("unitid")] = {
                        productQuanity  : unit.find(".productQuanity").val(),
                        productName     : unit.find(".productName").val(),
                        productModel    : unit.find(".productModel").val(),
                        productPrice    : unit.find(".productPrice").val(),
                        attribute       : {}
                    };
                    $("[unitid-parent='"+unit.attr("unitid")+"']").each(function(k,value){
                        var $attr = $(value);
                        draftUnit.attribute[$attr.attr("unitid")] = {
                            productQuanity  : $attr.find(".productQuanity").val(),
                            productName     : $attr.find(".productName").val(),
                            productModel    : $attr.find(".productModel").val(),
                            productPrice    : $attr.find(".productPrice").val(),
                        };
                    });
                    
                });
                return data;
            }
            
            function setCalculations(data){
                for(var i in data){
                    var unitData = data[i];
                    if(typeof unitData !== "object") continue;
                    var unit = $("[unitid='"+i+"']");
                    
                    unit.find(".price").text(unitData.price.toFixed(2));
                    unit.find(".tax").text(unitData.tax.toFixed(2));
                    unit.find(".tprice").text(unitData.total.toFixed(2));
                }
                $(".sub-total").text(data.stotal.toFixed(2) );
                $(".ttax").text(data.ttotal.toFixed(2) );
                $(".total").text(data.total.toFixed(2) );
            }
        });
    };
});