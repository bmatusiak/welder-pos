define(function(require, exports, module) {

    return function(customerID) {
        var loaded = false;
        window.socket(function (socket) {
            var customerID = $(".customerID").val();
            var nextUnitID = 0;
            $(document).on('click','.addAttribute',function(){
                var unit = $(this).closest(".unit");
                var unitAtribute = createUnitAtribute(unit,++nextUnitID);
                saveDraft();
            });
            
            $(document).on('click','a.trash',function(){
                var unit = $(this).closest(".unit").length ? $(this).closest(".unit") : $(this).closest(".unitAttribute").length ?  $(this).closest(".unitAttribute") : false;
                    
                var unitIDparent = unit.attr("unitid-parent");
                if(!unitIDparent){
                    $("[unitid-parent='"+unit.attr("unitid")+"']").remove();
                } 
                    
                unit.remove();
                saveDraft();
            });
            $(document).on('change','input',function(){
                var unit = $(this).closest(".unit").length ? $(this).closest(".unit") : $(this).closest(".unitAttribute").length ?  $(this).closest(".unitAttribute") : false;
                
                saveDraft();
            });
            $(document).on('keyup','input',function(){
                var unit = $(this).closest(".unit").length ? $(this).closest(".unit") : $(this).closest(".unitAttribute").length ?  $(this).closest(".unitAttribute") : false;
                
                saveDraft();
            });
            
            $(document).find(".openInvoiceBtn").click(function(){
                $(".btn").addClass("disabled");
                $("input").attr("readonly","readonly");
                saveDraft(function(invoiceObject){
                    socket.emit("invoice-create-open",customerID,invoiceObject,function(invoiceID){
                        console.log(customerID,invoiceObject);
                        $("tr[unitid]").remove();
                        nextUnitID = 0;
                        //updateMainTotals();
                        saveDraft(function(){
                            document.location = "/invoices/"+invoiceID;    
                        });
                    });
                });
            });
            
            $(document).find(".trashDraftBtn").click(function(){
                $("tr[unitid]").remove();
                nextUnitID = 0;
                saveDraft();
            });
            
            $("#addBlank").click(function(){
                createUnit(++nextUnitID);
                saveDraft();
            });
            
            if(!loaded){
                socket.emit("invoice-load-draft",customerID,function(err,draft){
                    if(draft.nextUnitID)
                        nextUnitID = draft.nextUnitID;
                    
                    for(var i in draft){
                        var unitData = draft[i];
                        if(typeof unitData !== "object") continue;
                        var unit = createUnit(i);
                        unit.find(".productQuanity").val(unitData.productQuanity);
                        unit.find(".productName").val(unitData.productName);
                        unit.find(".productModel").val(unitData.productModel);
                        unit.find(".productPrice").val(unitData.productPrice);
                        for(var j in unitData.attribute){
                            var unitAtribute = createUnitAtribute(unit,j);
                            unitAtribute.find(".productQuanity").val(unitData.attribute[j].productQuanity);
                            unitAtribute.find(".productName").val(unitData.attribute[j].productName);
                            unitAtribute.find(".productModel").val(unitData.attribute[j].productModel);
                            unitAtribute.find(".productPrice").val(unitData.attribute[j].productPrice);
                        } 
                        
                        unit.find(".price").text(unitData.price.toFixed(2));
                        unit.find(".tax").text(unitData.tax.toFixed(2));
                        unit.find(".tprice").text(unitData.total.toFixed(2));
                    }
                    
                    $(".sub-total").text(draft.stotal.toFixed(2));
                    $(".ttax").text(draft.ttotal.toFixed(2));
                    $(".total").text(draft.total.toFixed(2));
                
                    loaded = true;
                    
                    $("#loadingUnits").hide();
                    
                    $(".onInvoiceLoad,.producttable").show();
                }); 
            }
            
            function createUnit(id){
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
            }
            function createUnitAtribute(unit,id){
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
            }  
            
            var saving = false;
            
            function saveDraft(callback){
                if(!loaded || saving) return;
                saving = true;
                $(".saveDraftBtn").removeClass("btn-success");
                $(".saveDraftBtn").addClass("btn-warning");
                $(".saveDraftBtn").addClass("disabled");
                
                var draftObject = {nextUnitID:nextUnitID};
                $(".unit").each(function(k,value){
                    var unit = $(value);
                    var draftUnit = draftObject[unit.attr("unitid")] = {
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
                
                socket.emit("invoice-save-draft",customerID,draftObject,function(err,draftData){
                    saving = false;
                    $(".saveDraftBtn").removeClass("btn-warning");
                    $(".saveDraftBtn").removeClass("disabled");
                    $(".saveDraftBtn").addClass("btn-success");
                    for(var i in draftData){
                        var unitData = draftData[i];
                        if(typeof unitData !== "object") continue;
                        var unit = $("[unitid='"+i+"']");
                        
                        unit.find(".price").text(unitData.price.toFixed(2));
                        unit.find(".tax").text(unitData.tax.toFixed(2));
                        unit.find(".tprice").text(unitData.total.toFixed(2));
                    }
                    $(".sub-total").text(draftData.stotal.toFixed(2) );
                    $(".ttax").text(draftData.ttotal.toFixed(2) );
                    $(".total").text(draftData.total.toFixed(2) );
                    
                    if(callback) callback(draftData);
                }); 
            }
        });
    };
});