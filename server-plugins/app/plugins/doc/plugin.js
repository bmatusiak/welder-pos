"use strict";

module.exports = function(options, imports, register) {

    var app = imports.app;

    app.menus.
    register("USERDROPDOWN", {
        link: "/doc",
        title: "Documentation",
        sort: 10000
    });

    var fs = require('fs');
    var markdown = require("markdown").markdown;

    function getDocuments(callback) {
        var path = __dirname + "/documentation";
        fs.readdir(path, function(err, items) {
            if (err) return callback(err, null);
            var $items = {};

            for (var i = 0; i < items.length; i++) {
                $items[items[i]] = path + "/" + items[i];
            }
            callback(null, $items);
        });
    }

    var documents = {};
    documents;

    function runDocumentation(filename, req, res, editing, documentData) {

        editing = editing || req.query.edit || false;
        
        if (!documents[filename] && editing) {
            
            documents[filename] =  __dirname + "/documentation" + "/" + filename;
            
            //req.ejs(app.dir.template + "/error.html", { error: "document don't exist" });
            
            fs.writeFileSync(documents[filename],"");
            //return;
        }else if(!documents[filename]){
            req.ejs(app.dir.template + "/error.html", { error: "document don't exist <a href='/doc/"+filename+"?edit=true'> Click here to create</a>" });
            return;
        }

        if(editing && documentData){
            console.log("saving",documents[filename]);
            fs.writeFileSync(documents[filename],documentData);
            res.send("true");
            return;
        }
            
        var documentation;
        var data = fs.readFileSync(documents[filename]);
        if (editing) {
            documentation = data.toString();
        }
        else {
            documentation = markdown.toHTML(data.toString());
        }

        req.ejs(__dirname + "/documentation.html", {
            app: app,
            editing: editing,
            documentation: documentation,
            $filename:filename
        });
    }

    getDocuments(function(err, data) {
        if (err) throw err;

        documents = data;
        console.log(data);

        app.welder.addRequestParser(function(http) {
            http.get('/doc', app.users.checkUserAuth(), function(req, res, next) {
                res.redirect("/doc/index.md");
            });
            http.get('/doc/:filename?', app.users.checkUserAuth(), function(req, res, next) {
                runDocumentation(req.params.filename, req, res);
            });
            http.post('/doc/:filename?', app.users.checkUserAuth(), function(req, res, next) {
                runDocumentation(req.params.filename, req, res, true, req.body.documentData);
            });
        });
    });

    register(null, {
        "doc": {}
    });

};
