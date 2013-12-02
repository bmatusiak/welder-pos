"use strict";
var assert = require("assert");
var serializer = require('serializer');
module.exports = function(options, imports, register) {
    
    options.crypt_key = options.crypt_key || serializer.randomString(128);
    options.sign_key = options.sign_key || serializer.randomString(128);
    
    
    assert(options.crypt_key, "option 'crypt_key' is required");
    assert(options.sign_key, "option 'sign_key' is required");
    
    var plugin = serializer.createSecureSerializer(
        options.crypt_key,
        options.sign_key
    );
    
    register(null, {
        'serializer': plugin
    });
};
