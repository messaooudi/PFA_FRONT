var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


var server = app.listen(80,"localhost");

var eModuleRouteHandler = require('./eModuleRoute');
var profRouteHandler = require('./profRoute');

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://192.168.1.19:8888');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use('/gestionfiliere/eModules',eModuleRouteHandler);
app.use('/gestionfiliere/profs',profRouteHandler);


/*
//res.snd(JSON.stringify({type : "",code : '', message : "",body : ""}, null));
app.post("/gestionfiliere/eModules/creeEmodule",function(req,res){
       console.log(req.connection.remoteAddress+" requested "+req.path);
       console.log("request is : "+JSON.stringify(req.body,null));
s       res.setHeader('Content-Type', 'application/json');
       //connection a la base de donnée
       var db = mongoose.connection; 
       mongoose.connect('mongodb://localhost:27017/test');
       
       db.on('error',function(){
                 console.log(JSON.stringify({code : '001',message :"connection to database faild"}));
                 res.send(JSON.stringify({code : '001',message :"connection to database faild"}));
                 mongoose.connection.close();
       });
       
       db.once('open',function(){
           console.log("connection to database ");
           console.log("response is : ");
           async.waterfall([
               function(callback){
                   databaseModels.eModules.find({intitulee : req.body.intitulee},function(err,doc){
                       if(err) return callback({code : '002',message:"database problem!"})
                       if(doc.length>0) return callback({code : '003',message : "Intitulee taken !!"});
                       callback(null);
                   });  
               },
               function(callback){
                   var eModule = new databaseModels.eModules({
                                        intitulee : req.body.intitulee,
                                        createdBy : req.body.userId,
                                        sendTo : req.body.targetUsers,
                                        creationDate : new Date(),
                                        lastUpdate : new Date(),
                                        updatedBy : req.body.userId});
                   eModule.save(function(err){
                       if(err) return callback({code : '002',message :"database problem!"});
                       callback(null,eModule._id);
                   });
               },
               function(eModuleId,callback){
                   async.each(
                           req.body.targetUsers,
                           function(element,callback){
                               databaseModels.profs.findById(element.id,function(err,prof){
                               if(!err&&prof){
                                   prof.addNotif({
                                       eModule : eModuleId,
                                       permision : element.permision,
                                       status : "unseen",
                                       date : new Date() 
                                   });
                                   prof.save(function(err){
                                       callback(null);
                                   });
                                 }
                               });
                           },
                           function(err){
                               callback(null,null);
                           }) 
               }
           ],
           function(err,data){
               if(err){ 
                    res.send(JSON.stringify(err,null,'\t'));
                    console.log(JSON.stringify(err,null,'\t'))
               }
               else{
                    res.send(JSON.stringify({code : "200",message:"",data : data},null,'\t'));
                    console.log(JSON.stringify({code : "200",message:"",data : data},null,'\t'))
               }
               console.log("connection to database closed"); 
               mongoose.connection.close();
           }
           )
       });
});

app.post("/gestionfiliere/eModules/shareEmodule",function(req,res){
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
           console.log("connection to database ");
           console.log("response is : ");
           async.series([
               function(callback){
                   databaseModels.eModules.findById(req.body.eModuleId,function(err,eModule){
                       if(err) return callback({code : '002',message :"database problem!"});
                       if(!eModule) return callback({code : '004',message :"eModule doesn't exist!!"})
                           eModule.appendSendTo(req.body.targetUsers);
                           eModule.save(function(err){
                               if(err) return callback({code : '002',message :"database problem!"},null);
                               callback(null,null);
                           });
                   });
               },
               function(callback){
                   async.each(
                           req.body.targetUsers,
                           function(element,callback){
                               databaseModels.profs.findById(element.id,function(err,prof){
                               if(!err&&prof){
                                   prof.addNotif({
                                       eModule : req.body.eModuleId,
                                       permision : element.permision,
                                       status : "unseen",
                                       date : new Date() 
                                   });
                                   prof.save(function(err){
                                       callback(null);
                                   });
                                 }
                               });
                           },
                           function(err){
                               callback(null,null);
                           }) 
               }
           ],
           function(err,data){
               if(err){ 
                    res.send(JSON.stringify(err,null,'\t'));
                    console.log(JSON.stringify(err,null,'\t'))
               }
               else{
                    res.send(JSON.stringify({code : "200",message:"",data : data},null,'\t'));
                    console.log(JSON.stringify({code : "200",message:"",data : data},null,'\t'))
               }
               console.log("connection to database closed"); 
               mongoose.connection.close();
           }
           )
           
       });
       
       
});


app.post("/gestionfiliere/eModules/updateEmodule",function(req,res){
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
           console.log("connection to database ");
           console.log("response is : ");
             
       });
       
});

app.post("/gestionfiliere/eModules/deleteEmodule",function(req,res){
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
           console.log("connection to database ");
           console.log("response is : ");
           async.series([
               function(callback){
                   databaseModels.eModules.findById(req.body.eModuleId,function(err,eModule){
                       if(err) return callback({code : '002',message :"database problem!"},null);
                       if(!eModule) return callback({code : '004',message :"eModule doesn't exist!!"})
                       async.each(
                           eModule.sendTo,
                           function(element,callback){
                               databaseModels.profs.findById(element.id,function(err,prof){
                               if(err) return callback(err);
                               if(!prof) return callback(err)
                                   prof.deleteEModule(req.body.eModuleId);
                                   prof.save(function(err){
                                       if(err) return callback(err)
                                       callback(null);
                                   });
                               });
                           },
                           function(err){
                               if(err) return callback(err,null);
                               callback(null,null);
                           })  
                   });
               },
               function(callback){
                  databaseModels.eModules.remove({_id : req.body.eModuleId},function(err){
                       if(err) return callback({code : '002',message :"database problem!!"},null);
                       callback(null,null);
                   });
               }
           ],
           function(err,data){
               if(err){ 
                    res.send(JSON.stringify(err,null,'\t'));
                    console.log(JSON.stringify(err,null,'\t'))
               }
               else{
                    res.send(JSON.stringify({code : "200",message:"eModule deleted",data : data},null,'\t'));
                    console.log(JSON.stringify({code : "200",message:"",data : data},null,'\t'))
               }
               console.log("connection to database closed"); 
               mongoose.connection.close();
           });
       })
      
});

app.post("/gestionfiliere/eModules/getEmodule",function(req,res){
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
           console.log("connection to database ");
           console.log("response is : ");
           async.series([
               function(callback){
                   databaseModels.eModules.find(req.body.query,req.body.fields,function(err,eModules){
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
               console.log("connection to database closed"); 
               mongoose.connection.close();
           });
       });
});*/



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




