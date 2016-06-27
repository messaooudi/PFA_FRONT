
var express = require('express');
var async = require('async')
var mongoose = require('mongoose');
var databaseModels = require('./databaseModels')
var cluster = require('express-cluster');



    
var router = express.Router();

var errorMessage = function(code,message){
    return {code : code,message : message}
}

cluster(function(worker){
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
                                        updatedBy : req.body.userId,
                                        status : 'incomplet'
                                        });
                      eModule.save(function(err){
                           if(err) return callback({code : '002',message :"database problem!"});
                          callback(null,eModule._id);
                      });
               },function(eModuleId,callback){
                   var newNotif = new databaseModels.eModuleNotif({
                                                                intitulee :req.body.intitulee,
                                                                eModule : eModuleId,
                                                                prof : req.body.userId,
                                                                status : "unseen",
                                                                typee : 'share',
                                                                date : new Date() 
                                                             });
                   newNotif.save(function(err){
                       if(err) return callback({code : '008',message :"prob saving notif"});
                       callback(null,newNotif._id)
                    }); 
               },
               function(notifId,callback){
                   async.each(
                           req.body.sendTo,
                           function(element,callback){
                               databaseModels.profs.findById(element._id,function(err,prof){
                               if(!prof) return callback(errorMessage('005',"prof n'existe pas!"));
                               if(!err){
                                  if(prof._id != req.body.userId){
                                     prof.addNotif(notifId);
                                     prof.save(function(err){
                                         //if(err) return callback(errorMessage('006','erreur add notif to prof'))
                                         callback(null);
                                     })
                                           
                                   }else{
                                       callback(null);
                                   }
                               }else{
                                   callback(errorMessage('002','database Problem'))
                               }
                               });
                           },
                           function(err){
                               if(err) return callback(err,null);
                               callback(null)
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
           async.waterfall([
               function(callback){
                   databaseModels.eModules.findById(req.body.eModuleId,function(err,eModule){
                       if(err) return callback({code : '002',message :"database problem!"});
                       if(!eModule) return callback({code : '004',message :"eModule doesn't exist!!"})
                           eModule.appendSendTo(req.body.sendTo);
                           eModule.save(function(err){
                               if(err) return callback({code : '002',message :"database problem!"});
                               callback(null);
                           });
                   });
               },
               function(callback){
                   var newNotif = new databaseModels.eModuleNotif({
                                                                intitulee :req.body.intitulee,
                                                                eModule : req.body.eModuleId,
                                                                prof : req.body.userId,
                                                                status : "unseen",
                                                                typee : 'share',
                                                                date : new Date() 
                                                             });
                   newNotif.save(function(err){
                       if(err) return callback({code : '008',message :"prob saving notif"});
                       callback(null,newNotif._id)
                    }); 
               },
               function(notifId,callback){
                   async.each(
                           req.body.sendTo,
                           function(element,callback){
                               databaseModels.profs.findById(element._id,function(err,prof){
                               if(!prof) return callback(errorMessage('005',"prof n'existe pas!"));
                               if(!err){
                                  if(prof._id != req.body.userId){
                                     prof.addNotif(notifId);
                                     prof.save(function(err){
                                         //if(err) return callback(errorMessage('006','erreur add notif to prof'))
                                         callback(null);
                                     })
                                           
                                   }else{
                                       callback(null);
                                   }
                               }else{
                                   callback(errorMessage('002','database Problem'))
                               }
                               });
                           },
                           function(err){
                               if(err) return callback(err,null);
                               callback(null)
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
                   eModule.setAtt('status',req.body.status);
                   
                   eModule.save(function(err){
                       if(err) return callback({code : '002',message:"database problem!"});
                       callback(null,eModule._id,eModule.createdBy,eModule.sendTo,req.body.userId);
                   });
                   
               },
               function(eModuleId,eModuleCreatedBy,eModuleSendTo,userId,callback){
                   //update notif of owner
                   //notif others
                   var newNotif = new databaseModels.eModuleNotif({
                                                                intitulee :req.body.intitulee,
                                                                eModule : req.body.eModuleId,
                                                                prof : userId,
                                                                status : "unseen",
                                                                typee : 'update',
                                                                date : new Date() 
                                                             })
                   async.waterfall([
                       function(callback){
                           var newNotif = new databaseModels.eModuleNotif({
                                                                intitulee :req.body.intitulee,
                                                                eModule : req.body.eModuleId,
                                                                prof : userId,
                                                                status : "unseen",
                                                                typee : 'update',
                                                                date : new Date() 
                                                             })
                          newNotif.save(function(err){
                              if(err) return callback(errorMessage('008','prob saving notif'))
                              else{
                                  callback(null,newNotif._id)
                              }
                          })
                       },
                       function(notifId,callback){
                        if(eModuleCreatedBy != userId){
                         databaseModels.profs.findById(eModuleCreatedBy,function(err,prof){
                            if(!prof){callback(null,notifId)}
                            else if(err){callback(null,notifId)}
                            else{
                                 prof.addNotif(notifId);
                                 prof.save(function(err){
                                    callback(null,notifId)
                                  })
                            }
                        })
                        }else{
                            callback(null,notifId)
                        }
                       },
                       function(notifId,callback){
                           async.each(
                           eModuleSendTo,
                           function(element,callback){
                               databaseModels.profs.findById(element.id,function(err,prof){
                               if(!err&&prof){
                                   if(prof._id != userId){
                                           prof.addNotif(notifId);
                                           prof.save(function(err){
                                               callback(null);
                                           })

                                   }else {
                                       callback(null);
                                   }
                               }else{
                                   callback(null)
                               }
                               });
                           },
                           function(err){
                               callback(err,null);
                           })
                       }   
                   ],function(err,data){
                       if(err) return callback(err)
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



//{eModuleId : _Id ,userId : _Id,intitulee : intitulee}
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
           async.waterfall([
               function(callback){
                   databaseModels.eModules.findById(req.body.eModuleId,function(err,eModule){
                       if(err) return callback({code : '002',message :"database problem!"});
                       if(!eModule) return callback({code : '004',message :"eModule doesn't exist!!"})
                       callback(null,eModule.sendTo);
                   });
               },
               function(sendTo,callback){
                           var newNotif = new databaseModels.eModuleNotif({
                                                                intitulee :req.body.intitulee,
                                                                eModule : req.body.eModuleId,
                                                                prof : req.body.userId,
                                                                status : "unseen",
                                                                typee : 'delete',
                                                                date : new Date() 
                                                             })
                          newNotif.save(function(err){
                              if(err) return callback(errorMessage('008','prob saving notif'))
                              else{
                                  callback(null,newNotif._id,sendTo)
                              }
                          })
                 },
                function(notifId,sendTo,callback){
                           async.each(
                           sendTo,
                           function(element,callback){
                               databaseModels.profs.findById(element.id,function(err,prof){
                               if(!err&&prof){
                                   if(prof._id != req.body.userId){
                                           prof.addNotif(notifId);
                                           prof.save(function(err){
                                               callback(null);
                                           })

                                   }else {
                                       callback(null);
                                   }
                               }else{
                                   callback(null)
                               }
                               });
                           },
                           function(err){
                               callback(null,null);
                           })
                       } 
               ,
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
       console.log("++++++++++++++++++++++++"+worker.id)
       res.setHeader('Content-Type', 'application/json');
       //connection a la base de donnée
       var db = mongoose.connection; 
       mongoose.connect('mongodb://localhost:27017/test');
       
       db.on('error',function(){
                 console.log(JSON.stringify({code : '001',message :"connection to database faild"},null));
                  mongoose.connection.close();   
                 res.send(JSON.stringify({code : '001',message :"connection to database faild"}));
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



//{userId : id,searchQuery : {key : value},responseFields : "filed1 filed2 ..",populate : [{path : '',select:''}]}
router.post("/getNotif",function(req,res){
       res.setHeader('Content-Type', 'application/json');
       //connection a la base de donnée
       var db = mongoose.connection; 
       mongoose.connect('mongodb://localhost:27017/test');
       
       db.on('error',function(){
                 console.log(JSON.stringify({code : '001',message :"connection to database faild"},null));
                 mongoose.connection.close();   
                 res.send(JSON.stringify({code : '001',message :"connection to database faild"}));
       });
       
       db.once('open',function(){
           console.log("connection to database ");
           console.log("response is : ");
           async.series([
               function(callback){
                  var query =  databaseModels.eModuleNotif.find(req.body.searchQuery,req.body.responseFields);
                   //query.populate('createdBy');
                   if(req.body.populate)
                   for(var i = 0 ; i<req.body.populate.length ; i++){
                       query.populate(req.body.populate[i]);
                       console.log(JSON.stringify(req.body.populate[i]))
                   }
                   //.populate('updatedBy')
                   //.populate({path : 'sendTo.id',select :'nom'})
                   query.exec(
                   function(err,Notif){
                       if(err) return callback({code : '002',message :"database problem!!"},null);
                        callback(null,Notif);
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


//{notifId : _id , status : 'seen'|'unseen'}
router.post("/updateNotif",function(req,res){
       res.setHeader('Content-Type', 'application/json');
       //connection a la base de donnée
       var db = mongoose.connection; 
       mongoose.connect('mongodb://localhost:27017/test');
       
       db.on('error',function(){
                 console.log(JSON.stringify({code : '001',message :"connection to database faild"},null));
                 mongoose.connection.close();   
                 res.send(JSON.stringify({code : '001',message :"connection to database faild"}));
       });
       
       db.once('open',function(){
           console.log("connection to database ");
           console.log("response is : ");
           async.series([
               function(callback){
                 databaseModels.eModuleNotif.update({_id : req.body.notifId},{status : req.body.status},function(err,numAffected){
                     if(err) return callback(errorMessage('002','prob database notif'));
                     if(numAffected < 1 ) return callback(errorMessage('009','notif not found'));
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
                    res.send(JSON.stringify({code : "200",message:"",data : data[0]},null,'\t'));
                    console.log(JSON.stringify({code : "200",message:"",data : data[0]},null,'\t'))
               }
               console.log("connection to database closed"); 
               mongoose.connection.close();
           });
       });
});
},{count : 4});

module.exports = router;


