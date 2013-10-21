define(function(require, exports, module) {

    return function(customerID) {
        var loaded = false;
        window.socket(function (socket) {
        
            var nextUnitID = 0;
            $(document).on('click','.addAttribute',function(){
                var unit = $(this).closest(".unit");
                var unitAtribute = createUnitAtribute(unit,++nextUnitID);
                
                updateUnitPrice(unit);
            });
            
            $(document).on('click','a.trash',function(){
                var unit = $(this).closest(".unit").length ? $(this).closest(".unit") : $(this).closest(".unitAttribute").length ?  $(this).closest(".unitAttribute") : false;
                    
                var unitIDparent = unit.attr("unitid-parent");
                if(!unitIDparent){
                    $("[unitid-parent='"+unit.attr("unitid")+"']").remove();
                } 
                    
                unit.remove();
                updateMainTotals();
            });
            $(document).on('change','input',function(){
                var unit = $(this).closest(".unit").length ? $(this).closest(".unit") : $(this).closest(".unitAttribute").length ?  $(this).closest(".unitAttribute") : false;
                
                updateUnitPrice(unit);
            });
            $(document).on('keyup','input',function(){
                var unit = $(this).closest(".unit").length ? $(this).closest(".unit") : $(this).closest(".unitAttribute").length ?  $(this).closest(".unitAttribute") : false;
                
                updateUnitPrice(unit);
            });
            
            $(document).find(".saveDraftBtn").click(function(){
                
            })
            
            updateMainTotals();
            
            if(!loaded){
                socket.emit("invoice-load-draft",customerID,function(err,draft){
                    
                    for(var i in draft){
                        
                        //var unitID = i;
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
                        
                        updateUnitPrice(unit);
                    }
                    
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
                        var dataA = [];
                        
                        var dataR = [{
                            label: "Test", 
                            value: "Test",
                            model: "test-sku",
                            price:"10.99"
                        },{
                            label: "Test2",
                            value: "Test2",
                            model: "test2-sku",
                            price:"19.99"
                        }];
                        for (var i=0;i<dataR.length;i++){ 
                            console.log();
                            if(dataR[i].label.indexOf(req.term) >= 0)
                            dataA.push(dataR[i]);
                        }
                        console.log(dataA);
                        res(dataA);
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
            $("#addBlank").click(function(){
                var unit = createUnit(++nextUnitID);
                
                updateUnitPrice(unit);
            });
            
            
            function updateUnitPrice(unit){
                if(unit){
                    var unitIDparent = unit.attr("unitid-parent");
                    if(unitIDparent) unit = $("[unitid='"+unitIDparent+"']");
                    
                    if(!unitIDparent) unitIDparent = unit.attr("unitid");
                    var addAttributes = 0;
                    
                    $("[unitid-parent='"+unitIDparent+"']").each(function(k,value){
                        var thisUnit = $(value);
                        var upval = thisUnit.find(".productPrice").val() !== "" ? thisUnit.find(".productPrice").val() : "0.00";
                        var unitPrice = parseFloat(upval).toFixed(2);
                                               
                        var unitQuanity = parseFloat(thisUnit.find(".productQuanity").val() !== "" ? thisUnit.find(".productQuanity").val() : 0);
                                            
                        var qPrice = parseFloat((unitPrice * unitQuanity).toFixed(2));
                        addAttributes += qPrice;
                                            
                    });
                    
                    updateUnitTotal(unit,addAttributes);
                    
                }
            }
            function updateUnitTotal(unit,attributesAmount){
                var upval = unit.find(".productPrice").val() !== "" ? unit.find(".productPrice").val() : "0.00";
                var unitPrice = parseFloat(upval).toFixed(2);
                   
                var unitQuanity = parseFloat(unit.find(".productQuanity").val() !== "" ? unit.find(".productQuanity").val() : 0);
                
                var PriceEle = unit.find(".price");
                var taxEle = unit.find(".tax");
                var tPriceEle = unit.find(".tprice");
                
                var qPrice = parseFloat((unitPrice * unitQuanity).toFixed(2));
                qPrice += attributesAmount;
                PriceEle.text(qPrice.toFixed(2));
                
                var tPrice = parseFloat((Math.round((qPrice*0.06) * 100) / 100).toFixed(2));
                taxEle.text(tPrice.toFixed(2));
                
                tPriceEle.text((qPrice+tPrice).toFixed(2));
                
                updateMainTotals();
            }
            function updateMainTotals(){
                var subTotal = $(".sub-total");
                subTotal.text("0.00");
                var stotal = 0;
                $(".price").each(function(k,value){
                    stotal += parseFloat($(value).text());
                });
                subTotal.text(stotal.toFixed(2) );
                
                var TTax = $(".ttax");
                TTax.text("0.00");
                var ttotal = 0;
                $(".tax").each(function(k,value){
                    ttotal += parseFloat($(value).text());
                });
                
                TTax.text(ttotal.toFixed(2) );
            
                var Total = $(".total");
                Total.text("0.00");
                var total = 0;
                $(".tprice").each(function(k,value){
                    total += parseFloat($(value).text());
                    Total.text(total.toFixed(2) );
                });
                
                saveDraft();
            }
            
            function saveDraft(){
                if(!loaded) return;
                console.log("saving draft");
                $(".saveDraftBtn").removeClass("btn-success");
                $(".saveDraftBtn").addClass("btn-danger");
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
                
                if(loaded){
                    socket.emit("invoice-save-draft",customerID,draftObject,function(err){
                        $(".saveDraftBtn").removeClass("btn-danger");
                        $(".saveDraftBtn").removeClass("disabled");
                        $(".saveDraftBtn").addClass("btn-success");
                    }); 
                }
            }
            
            
        });
    };
});