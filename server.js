var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var cluster = require('express-cluster');


cluster(function(worker){

var app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


var server = app.listen(80,"192.168.1.19");

var eModuleRouteHandler = require('./eModuleRoute');
var profRouteHandler = require('./profRoute');


app.use('/gestionfiliere/eModules',eModuleRouteHandler);
app.use('/gestionfiliere/profs',profRouteHandler);

app.get("/*",function(req,res){ 
    var file = __dirname+req.path;
    fs.exists(file,function(exists){
       if(exists){
           res.sendFile(file);
           console.log(file);
       }else{
           //sres.redirect("/FRONT_TEST/");
           console.log(file+":NOT EXISTE");
       } 
    });
});

},{count: 8})


