"use strict";

module.exports = function(db) {

    var Schema = db.Schema;

    var collection = "products";

    var modelSchema = new Schema({
        productid: {type: Number, unique:true},
        name: String,
        model: { type: String, unique: true },
        price: String,
        stock: Number,
        created: Date,
        createdBy: String
    });

    var Products = db.model(collection, modelSchema);

    var newProduct = function(
        name,
        model,
        price,
        stock,
        whoCreatedLogin,
        callback) {
        Products.findOne({ model: model }, function(err, product) {
            if (!err && !product) {

                db.counter("Products",1, function(count) {
                    if(err) return;
                    product = new Products();
                    product.productid = count;
                    product.name = name;
                    product.model = model;
                    product.price = price;
                    product.stock = stock;

                    product.created = Date.now();
                    product.createdBy = whoCreatedLogin;
                    product.save(callback);
                });
            }
            else if (!err && product !== null) {
                callback("Product With Model '" + model + "' Exists!");
            }
        });
    };

    var getProduct = function(queryObject, callback) {
        Products.findOne(queryObject, function(err, product) {
            if (!err && !product) {
                callback("Product Not Found!");
            }
            else if (!err && product !== null) {
                callback(null, product);
            }
            else callback("Product Not Found!");
        });
    };

    var listProducts = function(queryObject, callback) {
        if (!callback) {
            Products.find(function(err, products) {
                queryObject(err, products);
            });
        }
        else {
            Products.find(queryObject, function(err, products) {
                callback(err, products);
            });
        }
    };

    var productsPage = function(page, perPage, callback) {
        Products.find({})
            .limit(perPage)
            .skip(perPage * page)
            .sort({ created: 'desc' })
            .exec(function(err, products) {
                Products.count().exec(function(err, count) {
                    callback(null, {
                        results: products,
                        page: page,
                        pages: count / perPage
                    });
                });
            });
    };

    return {
        newProduct: newProduct,
        getProduct: getProduct,
        listProducts: listProducts,
        productsPage: productsPage
    };
};
