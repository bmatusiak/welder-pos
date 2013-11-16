"use strict";
var fs = require("fs");
var ejs = require("ejs");

module.exports = function(options, imports, register) {
    var enabled;
    
    var nodemailer = require("nodemailer");
    var auth={};
    if(process.env.EMAILER_USER && process.env.EMAILER_PASS){
        auth = {
            user: process.env.EMAILER_USER,
            pass: process.env.EMAILER_PASS
        };
        enabled = true;
    }else {
        try{
            auth = require("./_.emailerAuth.json");
            enabled = true;
        }catch(e){
            enabled = false;
        }
    }
    
    var plugin = {
            enabled :enabled,
            templates:__dirname+"/templates",
            sendTemplate:function(temlateFile,email,ejs_data,callback){
                //ejs_data.subject == set in template file
                if(!ejs_data) ejs_data = {};
                
                fs.readFile(temlateFile, function (err, data) {
                  if (err) return callback ? callback(err) : "";
                    data = ejs.render(data.toString(),{data:ejs_data});
                  
                    plugin.send(email,ejs_data.subject || "No Subject",data,callback);
                    
                });
            },
            send:function(email,subject,body,callback){
                if(!enabled) return callback("Not Enabled");
                
                var smtpTransport = nodemailer.createTransport("SMTP",{
                    service: "Gmail",
                    auth: auth
                });
                
                
                var mailOptions = {
                    from: auth.user, // sender address
                    to: email, // list of receivers
                    subject: subject, // Subject line
                    text: body
                };
                
                smtpTransport.sendMail(mailOptions, function(error, response){
                    if(callback)
                        callback(error, response);
                        
                    smtpTransport.close();
                });
            }
        };
        
                    
    register(null,{
        "emailer":plugin
    });
};
                    