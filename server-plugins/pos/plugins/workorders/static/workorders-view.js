define(function(require, exports, module) {
    /*global $ */
    function workorderTypeFNSetup(socket) {
        var obj = {};

        obj.createUnit = function(id) {
            var template = '<tr class="unit">' +
                '<td class="productNameRow">' +
                '<span style="width:35px" value="1"  class="productQuanity"></span>&nbsp;x&nbsp;<span class="productName" ></span>' +
                '</td>' +
                '<td class="productModelRow"><span class="productModel"></span></td>' +
                '<td><span class="productPrice"></span></td>' +
                '<td class="price"></td>' +
                '<td class="tax"></td>' +
                '<td class="tprice"></td>' +
                '</tr>';
            var row = $(template);
            var unit = row.closest(".unit");
            unit.attr("unitid", id);
            $(".unit-container").find(".unitsbottomRow").before(unit);
            return unit;
        };
        obj.createUnitAtribute = function(unit, id) {
            var templateAtribute = '<tr class="unitAttribute">' +
                '<td class="productNameRow">' +
                '<span style="width:35px" value="1"  class="productQuanity"></span>&nbsp;x&nbsp;<span class="productName" ></span>' +
                '</td>' +
                '<td class="productModelRow"><span class="productModel"></span></td>' +
                '<td><span class="productPrice"></span></td>' +
                '<td><i class="icon-level-up rotate"></i></td>' +
                '<td><i class="icon-level-up rotate"></i></td>' +
                '<td><i class="icon-level-up rotate"></i></td>' +
                '</tr>';
            var row = $(templateAtribute);
            var unitAtribute = row.closest(".unitAttribute");
            unit.after(unitAtribute);
            return unitAtribute;
        };



        return obj;
    }

    return function(docData) {


        var plugin = this;
        var loaded = false;
        plugin.on("loaded", function() {
            loaded = true;
            console.log("workorders loaded");
        });
        window.socket(function(socket) {
            var actions = workorderTypeFNSetup(socket);

            function setValue(ele, value) {
                if (ele[0] && ele[0].tagName == "INPUT") {
                    ele.val(value);
                }
                else ele.text(value);
            }

            function getValue(ele) {
                if (ele[0] && ele[0].tagName == "INPUT") {
                    return ele.val();
                }
                else return ele.text();
            }

            if (!loaded) {
                socket.emit("workorder-load", docData.workorderid, function(err, doc) {

                    if (!doc)
                        return;

                    var customerInfo = [
                        "Customer: "+doc.customer.uid,
                        "<hr /> <strong >"+doc.customer.name+"</strong> <br />",
                        doc.customer.address+"<br />",
                        doc.customer.city+", "+doc.customer.state+" "+doc.customer.zip+"<br />",
                        doc.customer.phone+" - "+doc.customer.email+"<br />"
                    ].join('');
                    $("#customerInfo").html(customerInfo);
                    
                    $("#issue").text(doc.issueData);
                    $("#workComplete").text(doc.workCompletedData);
                    $("#status").html(doc.status);
                        
                    for (var i in doc.data) {
                        var unitData = doc.data[i];
                        if (typeof unitData !== "object") continue;
                        var unit = actions.createUnit(i);
                        setValue(unit.find(".productQuanity"), unitData.productQuanity);
                        setValue(unit.find(".productName"), unitData.productName);
                        setValue(unit.find(".productModel"), unitData.productModel);
                        setValue(unit.find(".productPrice"), unitData.productPrice);
                        for (var j in unitData.attribute) {
                            var unitAtribute = actions.createUnitAtribute(unit, j);
                            setValue(unitAtribute.find(".productQuanity"), unitData.attribute[j].productQuanity);
                            setValue(unitAtribute.find(".productName"), unitData.attribute[j].productName);
                            setValue(unitAtribute.find(".productModel"), unitData.attribute[j].productModel);
                            setValue(unitAtribute.find(".productPrice"), unitData.attribute[j].productPrice);
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
                    $(".onworkorderLoad,.producttable").show();
                    if (docData.type == "workorder") $(".unitsbottomRow").hide();
                });
            }

        });
    };
});