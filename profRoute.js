
var express = require('express');
var async = require('async')
var mongoose = require('mongoose');
var databaseModels = require('./databaseModels')




var router = express.Router();


//{userId : id,searchQuery : {key : value},responseFields : "filed1 filed2 ..",populate : [{path : '',select:''}]}
router.post("/getProf",function(req,res){
       res.setHeader('Content-Type', 'application/json');
       //connection a la base de donnée
       var db = mongoose.connection; 
       mongoose.connect('mongodb://localhost:27017/test');
       
       db.on('error',function(){
                 console.log(JSON.stringify({code : '001',message :"connection to database faild"},null));
                 res.send(JSON.stringify({code : '001',message :"connection to database faild"}));
                 mongoose.connection.close();   
       });
        
       db.once('open',function(){
           console.log("connection to database profs");
           console.log("response is : ");
           async.series([
               function(callback){
                  var query =  databaseModels.profs.find(req.body.searchQuery,req.body.responseFields);
                   //query.populate('createdBy');
                   if(req.body.populate)
                   for(var i = 0 ; i<req.body.populate.length ; i++){
                       query.populate(req.body.populate[i]);
                   }
                   //.populate('updatedBy')
                   //.populate({path : 'sendTo.id',select :'nom'})
                   query.exec(
                   function(err,eModules){
                       if(err) return callback({code : '002',message :"database problem!!"},null);
                       callback(null,eModules);
                   });
               }
           ],
           function(err,data){
               if(err){ 
                    res.send(JSON.stringify(err,null,'\t'));
                    console.log(JSON.stringify(err,null,'\t'))
               }
               else{
                    res.send(JSON.stringify({code : "200",message:"",data : data[0]},null,'\t'));
                    console.log(JSON.stringify({code : "200",message:"",data : data[0]},null,'\t'))
               }
               console.log("connection to database prof closed"); 
               mongoose.connection.close();
           });
       });
});


module.exports = router;
