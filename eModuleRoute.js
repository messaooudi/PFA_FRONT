
var express = require('express');
var async = require('async')
var mongoose = require('mongoose');
var databaseModels = require('./databaseModels')


var router = express.Router();

var errorMessage = function(code,message){
    return {code : code,message : message}
}

//{intitulee : String,userId : _id,sendTo : [{id : _id,permision : "r|w"}]}
router.post("/creeEmodule",function(req,res){
       console.log(req.connection.remoteAddress+" requested "+req.path);
       console.log("request is : "+JSON.stringify(req.body,null));
       res.setHeader('Content-Type', 'application/json');
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
                                        sendTo : req.body.sendTo,
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
                           req.body.sendTo,
                           function(element,callback){
                               databaseModels.profs.findById(element._id,function(err,prof){
                               if(!prof) return callback(errorMessage('005',"Prof n'existe pas"));
                               if(!err){
                                   prof.addNotif({
                                       intitulee : '',
                                       eModule : eModuleId,
                                       prof : req.body.userId,
                                       status : "unseen",
                                       typee : 'share',
                                       date : new Date() 
                                   });
                                   prof.save(function(err){
                                       callback(null);
                                   });
                                }else{
                                    return callback(errorMessage('002','database prob!'))
                                }
                               });
                           },
                           function(err){
                               callback(err,null);
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

//{userId : id,eModuleId : _Id,sendTo : [{id : _id,permision : "r|w"}]}
router.post("/shareEmodule",function(req,res){
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
                           eModule.appendSendTo(req.body.sendTo);
                           eModule.save(function(err){
                               if(err) return callback({code : '002',message :"database problem!"},null);
                               callback(null,null);
                           });
                   });
               },
               function(callback){
                   async.each(
                           req.body.sendTo,
                           function(element,callback){
                               databaseModels.profs.findById(element._id,function(err,prof){
                               if(!prof) return callback(errorMessage('005',"prof n'existe pas!"));
                               if(!err){
                                   prof.addNotif({
                                       intitulee :'',
                                       eModule : req.body.eModuleId,
                                       prof : req.body.userId,
                                       status : "unseen",
                                       typee : 'share',
                                       date : new Date() 
                                   });
                                   prof.save(function(err){
                                       callback(null);
                                   });
                               }else{
                                   callback(errorMessage('002','database Problem'))
                               }
                               });
                           },
                           function(err){
                               callback(err,null);
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

//{eModuleId : id,userId : id,intitulee : String,prerequis : String,objectif : String , volume_horaire : {cour : number,td : numbeer,tp : number},
// activitees_pratique : [{libellee : String,objectif : String,travaux_terrain : number,projet : number,stage : number,visite_etude : number}
// description_programme : String,modalitee_evaluation : String,note_minimal : number}
router.post('/remplireEmodule',function(req,res){
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
           async.waterfall([
               function(callback){
                   databaseModels.eModules.find({intitulee : req.body.intitulee},function(err,doc){
                       if(err) return callback({code : '002',message:"database problem!"})
                       if(doc.length>0&&req.body.eModuleId!=doc[0]._id) return callback({code : '003',message : "Intitulee taken !!"});
                       callback(null);
                   });  
               },
               function(callback){
                  databaseModels.eModules.findById(req.body.eModuleId,function(err,eModule){
                      if(err) return callback({code : '002',message:"database problem!"})
                      if(!eModule) return callback({code : '004',message : "eModule not found !!"});
                      callback(null,eModule);
                  });
               },
               function(eModule,callback){
                   eModule.setAtt('intitulee',req.body.intitulee);
                   eModule.setAtt('prerequis',req.body.prerequis);
                   eModule.setAtt('objectif',req.body.objectif);
                   eModule.setAtt('volume_horaire',req.body.volume_horaire);
                   eModule.setAtt('activitees_pratique',req.body.activitees_pratique)
                   eModule.setAtt('description_programme',req.body.description_programme);                  
                   eModule.setAtt('modalitee_evaluation',req.body.modalitee_evaluation);                  
                   eModule.setAtt('note_minimal',req.body.note_minimal);                  
                   eModule.setAtt('lastUpdate',req.body.lastUpdate);                  
                   eModule.setAtt('updatedBy',req.body.updatedBy);                  
                   
                   eModule.save(function(err){
                       if(err) return callback({code : '002',message:"database problem!"});
                       callback(null,eModule._id,eModule.createdBy,eModule.sendTo,req.body.userId);
                   });
                   
               },
               function(eModuleId,eModuleCreatedBy,eModuleSendTo,userId,callback){
                   //update notif of owner
                   //notif others
                   if(eModuleCreatedBy != userId)
                        databaseModels.profs.findById(eModuleCreatedBy,function(err,prof){
                            if(!prof){}
                            else if(err){}
                            else{
                                    prof.addNotif({
                                            intitulee : '',
                                            eModule : req.body.eModuleId,
                                            prof : userId,
                                            status : "unseen",
                                            typee : "update",
                                            date : new Date() 
                                        });
                                        prof.save(function(err){
                                            
                                        });
                            }
                        })
                   async.each(
                           eModuleSendTo,
                           function(element,callback){
                               databaseModels.profs.findById(element.id,function(err,prof){
                               if(!err&&prof){
                                   console.log("####"+userId+"::::"+prof._id+"####")
                                   if(prof._id != userId)
                                        prof.addNotif({
                                            intitulee : '',
                                            eModule : req.body.eModuleId,
                                            prof : userId,
                                            status : "unseen",
                                            typee : "update",
                                            date : new Date() 
                                        });
                                   prof.save(function(err){
                                       callback(null);
                                   });
                               }else{
                                   callback(null)
                               }
                               });
                           },
                           function(err){
                               callback(err,null);
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



//{eModuleId : _Id ,userId : _Id,sendTo : []}
router.post("/deleteEmodule",function(req,res){
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
                               databaseModels.profs.findById(element._id,function(err,prof){
                               if(err) return callback(errorMessage('002','database Problem'));
                               if(!prof) return callback(errorMessage('005',"prof doesn't existe : "+element.id))
                                   prof.deleteEModule(req.body.eModuleId);
                                    prof.addNotif({
                                       intitulee : req.body.intitulee,
                                       eModule : req.body.eModuleId,
                                       prof : req.body.userId,
                                       status : "unseen",
                                       typee : "delete",
                                       date : new Date() 
                                   });
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


//{userId : id,searchQuery : {key : value},responseFields : "filed1 filed2 ..",populate : [{path : '',select:''}]}
router.post("/getEmodule",function(req,res){
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
                  var query =  databaseModels.eModules.find(req.body.searchQuery,req.body.responseFields);
                   //query.populate('createdBy');
                   if(req.body.populate)
                   for(var i = 0 ; i<req.body.populate.length ; i++){
                       query.populate(req.body.populate[i]);
                       console.log(JSON.stringify(req.body.populate[i]))
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
               console.log("connection to database closed"); 
               mongoose.connection.close();
           });
       });
});


module.exports = router;
