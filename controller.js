var serverip = 'localhost'

var app = angular.module('app', ['ui.router','ui.bootstrap.contextMenu']);

app.config(function($stateProvider, $urlRouterProvider) {

// For any unmatched url, redirect to /index.html
  $urlRouterProvider.otherwise("module");
  $stateProvider
    .state('eModule', {
      url: "/eModule",
      templateUrl: "eModule/index.html"
    })
    .state('module', {
      url: "/module",
      templateUrl: "module/index.html"
    })
    });

//Prof Services
app.service('profService',function($http){
    this.getProfs = function(req){
            return $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/profs/getProf',
                        data : req
                    })
    }
});


app.service('profsList',function(profService,$rootScope){
    var items = [];
                
    var load = function(){
            return profService.getProfs({searchQuery : {_id : { $ne : $rootScope.userId}},responseFields : 'nom'})
                    .then(function successCallback(response){
                                 items = response.data.data;
                                 $rootScope.$broadcast('profsListUpdate',{});
                            },
                            function errorCallback(response) {
                                
                            }
                      );

                
            };
    var getItems = function(){
        return items;
    };
    
    return {
        load : load,
        getItems : getItems
    };
});

//Module Services
app.service('moduleService',function($http){
    this.cree = function(req){
               return $http({
                     method: 'POST',
                     url: 'http://'+serverip+'/gestionfiliere/modules/creeModule',
                     data : req
                })
    }
    
    this.delete = function(req){
        return $http({
                    method: 'POST',
                    url: 'http://'+serverip+'/gestionfiliere/modules/deleteModule',
                    data : req
                })
    }
    
    this.share = function(req){
        return $http({
                    method: 'POST',
                    url: 'http://'+serverip+'/gestionfiliere/modules/shareModule',
                    data : req
                })
    }
    
    this.edite = function(req){
        return $http({
                    method: 'POST',
                    url: 'http://'+serverip+'/gestionfiliere/modules/remplireModule',
                    data : req
                })
    }
    
    this.load = function(req){
                 return $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/modules/getModule',
                        data : req
                    })
              }
});

app.service('modulesList',function(moduleService,$rootScope,$filter){
    var items = []
    var selectedItemIndex =  -1;
    
    var load = function(){
              items = [];
              return  moduleService.load({searchQuery : {/*createdBy : $rootScope.userId ,*/'coordonnateur' :{ $in : [$rootScope.userId]}},
                                    responseFields : '',
                                    populate : [{path : 'createdBy',select : 'nom'},{path : 'updatedBy',select : 'nom'},{path : 'coordonnateur',select : 'nom prenom'},{path : 'eModules',select : 'intitulee'}]})
                      .then(function successCallback(response){
                               items = items.concat(response.data.data);
                              return moduleService.load({searchQuery : {createdBy : $rootScope.userId },
                                    responseFields : '',
                                    populate : [{path : 'createdBy',select : 'nom'},{path : 'updatedBy',select : 'nom'},{path : 'coordonnateur',select : 'nom prenom'},{path : 'eModules',select : 'intitulee'}]})
                                .then(function successCallback(response){
                                        items = $filter('orderBy')(items.concat(response.data.data),'-lastUpdate');
                                        $rootScope.$broadcast('moduleListUpdate',{});
                                        },
                                        function errorCallback(response) {
                                            
                                        }
                                );
                            },
                            function errorCallback(response) {
                                
                            }
                      );
            };
    var getItems = function(){
        return items;
    }
    
    var getSelectedItemIndex = function(){
        return selectedItemIndex;
    }
    
    var setSelectedItemIndex = function(index){
        selectedItemIndex = index;
    }
    
    var getPermision = function(moduleId){
            for(var i=0 ; i<items.length ; i++){
                if(items[i]._id == moduleId){
                    if(items[i].createdBy._id == $rootScope.userId||items[i].coordonnateur._id == $rootScope.userId)
                        return 'w';
                    for(var j = 0 ; j<items[i].sendTo.length ; j++ ){
                        if(items[i].sendTo[j]._id._id == $rootScope.userId){
                            return items[i].sendTo[j].permision;
                        }
                    }
                }
            } 
        }
           
    return {
        load : load,
        getItems : getItems,
        getSelectedItemIndex : getSelectedItemIndex,
        setSelectedItemIndex : setSelectedItemIndex,
        getPermision : getPermision,
    }
    
});

app.service('moduleNotifService',function($http){
    this.getNotif = function(req){
            return $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/modules/getNotif',
                        data : req
                    })
    }
    
    this.updateNotif = function(req){
            return $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/modules/updateNotif',
                        data : req
                    })
    }
});

app.service('moduleNotifList',function($rootScope,moduleNotifService,profService){
    var items = [];
    var count = 0;
    var load = function(){
        return profService.getProfs({searchQuery :{ _id : $rootScope.userId},responseFields : 'notification.moduleNotif'})
                    .then(function successCallback(response){
                         return moduleNotifService.getNotif({searchQuery : {_id : {$in : response.data.data[0].notification.moduleNotif}},populate : [{path : 'module',select : 'intitulee'},{path : 'eModule',select : 'intitulee'},{path : 'prof',select : 'nom'}]})
                                    .then(function successCallback(response){
                                       items = response.data.data;
                                       if(items)
                                       for(var i=0 ; i< items.length ; i++){
                                           if(items[i].status == 'unseen')
                                                count++;
                                       }
                                       $rootScope.$broadcast('notifsListUpdate',{})
                                    },function errorCallback(respnse){
                                        
                                    });       
                     },
                     function errorCallback(response) {
                                
                      }
                     );
    };
    
    var getItems = function(){
        return items;
    }
    
    var getCount = function(){
        return count;
    }
    
    var setCount = function(n){
        count = n;
    }
    
    return {
        load : load,
        getItems : getItems,
        setCount : setCount,
        getCount : getCount
    }
})


//element de Module Services
app.service('eModuleService',function($http){
    this.cree = function(req){
               return $http({
                     method: 'POST',
                     url: 'http://'+serverip+'/gestionfiliere/eModules/creeEmodule',
                     data : req
                })
    }
    
    this.delete = function(req){
        return $http({
                    method: 'POST',
                    url: 'http://'+serverip+'/gestionfiliere/eModules/deleteEmodule',
                    data : req
                })
    }
    
    this.share = function(req){
        return $http({
                    method: 'POST',
                    url: 'http://'+serverip+'/gestionfiliere/eModules/shareEmodule',
                    data : req
                })
    }
    
    this.edite = function(req){
        return $http({
                    method: 'POST',
                    url: 'http://'+serverip+'/gestionfiliere/eModules/remplireEmodule',
                    data : req
                })
    }
    
    this.load = function(req){
                 return $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/eModules/getEmodule',
                        data : req
                    })
              }
});



app.service('eModulesList',function(eModuleService,$rootScope,$filter){
    var items = []
    var selectedItemIndex =  -1;
    
    var load = function(){
              items = [];
              return  eModuleService.load({searchQuery : {/*createdBy : $rootScope.userId ,*/'sendTo._id' :{ $in : [$rootScope.userId]}},
                                    responseFields : '',
                                    populate : [{path : 'createdBy',select : 'nom'},{path : 'updatedBy',select : 'nom'},{path : 'sendTo._id',select : 'nom'}]})
                      .then(function successCallback(response){
                               items = items.concat(response.data.data);
                              return eModuleService.load({searchQuery : {createdBy : $rootScope.userId },
                                    responseFields : '',
                                    populate : [{path : 'createdBy',select : 'nom'},{path : 'updatedBy',select : 'nom'},{path : 'sendTo._id',select : 'nom'}]})
                                .then(function successCallback(response){
                                        items = $filter('orderBy')(items.concat(response.data.data),'-lastUpdate');
                                        $rootScope.$broadcast('eModulesListUpdate',{});
                                        },
                                        function errorCallback(response) {
                                            
                                        }
                                );
                            },
                            function errorCallback(response) {
                                
                            }
                      );
            };
    var getItems = function(){
        return items;
    }
    
    var getSelectedItemIndex = function(){
        return selectedItemIndex;
    }
    
    var setSelectedItemIndex = function(index){
        selectedItemIndex = index;
    }
    

    
    var getPermision = function(eModuleId){
            for(var i=0 ; i<items.length ; i++){
                if(items[i]._id == eModuleId){
                    if(items[i].createdBy._id == $rootScope.userId)
                        return 'w';
                    for(var j = 0 ; j<items[i].sendTo.length ; j++ ){
                        if(items[i].sendTo[j]._id._id == $rootScope.userId){
                            return items[i].sendTo[j].permision;
                        }
                    }
                }
            } 
        }
    
    return {
        load : load,
        getItems : getItems,
        getSelectedItemIndex : getSelectedItemIndex,
        setSelectedItemIndex : setSelectedItemIndex,
        getPermision : getPermision,
    }
    
});

app.service('eModuleNotifService',function($http){
    this.getNotif = function(req){
            return $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/eModules/getNotif',
                        data : req
                    })
    }
    
    this.updateNotif = function(req){
            return $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/eModules/updateNotif',
                        data : req
                    })
    }
});

app.service('eModuleNotifList',function($rootScope,eModuleNotifService,profService){
    var items = [];
    var count = 0;
    var load = function(){
       return profService.getProfs({searchQuery :{ _id : $rootScope.userId},responseFields : 'notification.eModuleNotif'})
                    .then(function successCallback(response){
                         return eModuleNotifService.getNotif({searchQuery : {_id : {$in : response.data.data[0].notification.eModuleNotif}},populate : [{path : 'eModule',select : 'intitulee'},{path : 'prof',select : 'nom'}]})
                                    .then(function successCallback(response){
                                       items = response.data.data;
                                       if(items)
                                       for(var i=0 ; i< items.length ; i++){
                                           if(items[i].status == 'unseen')
                                                count++;
                                       }
                                       $rootScope.$broadcast('notifsListUpdate',{})
                                    },function errorCallback(respnse){
                                        
                                    });       
                     },
                     function errorCallback(response) {
                                
                      }
                      );
        
    };
    
    var getItems = function(){
        return items;
    }
    
    var getCount = function(){
        return count;
    }
    
    var setCount = function(n){
        count = n;
    }
    
    return {
        load : load,
        getItems : getItems,
        getCount : getCount,
        setCount : setCount
    }
})



//Module Controllers
app.controller('m_creeModalController',function($scope,$rootScope,moduleService,profService,modulesList,profsList){
         $scope.profs = profsList.getItems;
         $scope.cree = {
            req : {
                userId : '',
                intitulee : '',
                cordId : '',
            },
            validation : {
                 taken : false,
                 WTaken : false
            },
            init : function(){
               //$('.selectpicker').selectpicker('deselectAll');
                $('.selectpicker').selectpicker('refresh');

                $scope.cree.req.userId = $rootScope.userId
                $scope.cree.validation.WTaken = false;
                $scope.cree.validation.taken = false;
                $scope.cree.req.intitulee = '';
                $scope.creeModuleForm.intitulee.$setUntouched();
                $scope.cree.req.cordId = '';
            }
            ,
            submit : function(){
                $scope.cree.req.cordId = $scope.cree.req.cordId._id;
                moduleService.cree($scope.cree.req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                            modulesList.load();
                                            $('#creeModal').modal('hide');
                                        }else if(response.data.code == '003'){
                                            $scope.cree.validation.taken = true;
                                        }else {
                                             $('#creeModal').modal('hide');
                                        }
                                    },
                                    function errorCallback(response) {
                                     }
                             );
                
            },
            annuler : function(){

            }
        }
        
        $scope.$on('init_creeModal',function(){
            $scope.cree.init();
        })
        
})

app.controller('m_shareModalController',function($scope,$rootScope,moduleService,profService,modulesList,profsList){
         $scope.profs = profsList.getItems;
         $scope.share = {
            req : {
                userId : '',
                moduleId : '',
                cordId : '',
            },
            currentCord : '',
            removeCurrentCord : function(){
                $scope.share.currentCord = '';
            }
            ,
            init : function(){
               //$('.selectpicker').selectpicker('deselectAll');
                $('.selectpicker').selectpicker('refresh');

                $scope.share.req.userId = $rootScope.userId
                $scope.share.req.cordId = '';
                $scope.share.req.moduleId = modulesList.getItems()[modulesList.getSelectedItemIndex()]._id;
                $scope.share.currentCord = modulesList.getItems()[modulesList.getSelectedItemIndex()].coordonnateur;
            }
            ,
            submit : function(){
                $scope.share.req.cordId = $scope.share.req.cordId._id;
                moduleService.share($scope.share.req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                            modulesList.load();
                                            $('#shareModal').modal('hide');
                                        }else {
                                             $('#shareModal').modal('hide');
                                        }
                                    },
                                    function errorCallback(response) {
                                     }
                             );
                
            },
            annuler : function(){

            }
        }
        
        $scope.$on('init_shareModal',function(){
            $scope.share.init();
        })
        
})

app.controller('m_headerController',function($scope,$rootScope,moduleNotifList,profService,moduleNotifService,modulesList){
        $scope.selectedItemIndex = modulesList.getSelectedItemIndex;
        $scope.getPermision = modulesList.getPermision;
        $scope.header = {
            moduleNotif : moduleNotifList.getItems,
            newNotifCount : moduleNotifList.getCount,
            init : function(){
                   
            }
        }
        

        
        $scope.apercu = function(){
            $rootScope.$broadcast('init_apercuModal',{});
        }
        $scope.edite = function(){
            $rootScope.$broadcast('init_editeModal',{});
        }
        $scope.share = function(){
            $rootScope.$broadcast('init_shareModal',{});
        }
        $scope.cree = function(){
            $rootScope.$broadcast('init_creeModal',{});
        }
        $scope.reportChange = function(){
            $rootScope.$broadcast('updateSearch',$scope.search);
        }
        $scope.notifClick = function(notif){
            if(notif.module){
                $rootScope.$broadcast('init_editeModal',notif.module._id);
                $('#editeModal').modal('show');
            }
            if(notif.status == 'unseen'){
                notif.status == 'seen'
                moduleNotifList.setCount(moduleNotifList.getCount()-1)
                moduleNotifService.updateNotif({notifId : notif._id,status : 'seen'})
                                   .then(function(){
                })
            }
        }
});

app.controller('m_moduleTableController',function($scope,$rootScope,moduleService,profService,modulesList,profsList){
        $scope.selectedItemIndex = modulesList.getSelectedItemIndex;
        $scope.getPermision = modulesList.getPermision;
        $scope.moduleTable = {
            items : modulesList.getItems,
            search : '',
            selectedIndex : -1,
            init : function(){  
                $scope.moduleTable.selectedIndex = -1;
                modulesList.setSelectedItemIndex(-1);
                $scope.moduleTable.search = '';
            },
            menuOptions : [
                ['Apercu', function($itemScope){
                    $rootScope.$broadcast('init_apercuModal',{});
                    $('#apercuModal').modal('show');
                }],
                null,
                ['Modifier',function($itemScope){
                   $rootScope.$broadcast('init_editeModal',{});
                    $('#editeModal').modal('show');
                }],
                ['Partager...',function($itemScope){
                    $scope.moduleTable.selectedId = $itemScope.module._id;
                    $rootScope.$broadcast('init_shareModal',{});
                    $('#shareModal').modal('show');
                  
                }],
                null,
                ['Supprimer',function($itemScope){
                    $scope.moduleTable.selectedId = $itemScope.module._id;
                    $('#deleteModal').modal('show');
                }]
            ],
            menuOptionsw : [
                ['Apercu', function($itemScope){
                    $rootScope.$broadcast('init_apercuModal',{});
                    $('#apercuModal').modal('show');
                }],
                null,
                ['Modifier',function($itemScope){
                    $rootScope.$broadcast('init_editeModal',{});
                    $('#editeModal').modal('show');
                }],
               ],
            menuOptionsr : [
                ['Apercu', function($itemScope){
                    $rootScope.$broadcast('init_apercuModal',{});
                    $('#apercuModal').modal('show');
                }],
               ],
            clicked : function(index,id,_intitulee){
                $scope.moduleTable.selectedIndex = index;
                modulesList.setSelectedItemIndex(index);
            }
        }
         
        $scope.$on('updateSearch',function(event,search){
            $scope.moduleTable.search = search;
        })  
})

app.controller('m_deleteModalController',function($scope,$rootScope,moduleService,profService,modulesList,profsList){
     $scope.delete = {
            delete : function(){
                var id = modulesList.getItems()[modulesList.getSelectedItemIndex()]._id;
                var userId = $rootScope.userId;
                var intitulee = modulesList.getItems()[modulesList.getSelectedItemIndex()].intitulee;
                moduleService.delete({intitulee : intitulee,moduleId : id,userId : userId})
                               .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                         modulesList.load();
                                        }else{

                                        }
                                    },
                                    function errorCallback(response) {
                                     }
                             );
            }
        }
});

app.controller('m_editeModalController',function($scope,$rootScope,moduleService,profService,modulesList,profsList,eModulesList){
    $scope.eModules = eModulesList.getItems;
    $scope.edite = {
            req : {
                universite : '',
                etablissement : '',
                departement : '',
                intitulee : '',
                status : '',
                userId : '',
                updatedBy : '',
                eModules : [],
            },
            currentEModules : [],
            removeCurrentEM : function(index){
                $scope.edite.currentEModules.splice(index,1);
            },
            validation : {
                 taken : false,
                 WTaken : false
            },
            init : function(moduleId){
              var tmpModule = modulesList.getItems()[modulesList.getSelectedItemIndex()];
              if(moduleId)
                    for(var i=0 ; i<modulesList.getItems().length ; i++){
                        if(modulesList.getItems()[i]._id == moduleId){
                            tmpModule = modulesList.getItems()[i];
                            break;
                        } 
                    }  
              
              $scope.edite.req.moduleId = tmpModule._id;
              $scope.edite.req.userId = $rootScope.userId;
              $scope.edite.req.universite = tmpModule.universite;
              $scope.edite.req.etablissement = tmpModule.etablissement;
              $scope.edite.req.departement = tmpModule.departement;
              $scope.edite.req.intitulee = tmpModule.intitulee;
              $scope.edite.req.status = tmpModule.status; 
              $scope.edite.req.note_minimal = tmpModule.note_minimal;
              $scope.edite.currentEModules = tmpModule.eModules;
              
           
              $('.selectpicker').selectpicker()
              $('.selectpicker').selectpicker('refresh');
            },
           submit : function(){
                 $scope.edite.req.eModules =  $scope.edite.req.eModules.concat($scope.edite.currentEModules);
                 
                if(!$scope.editeForm.$pristine){
                    $scope.edite.req.lastUpdate = new Date();
                }
                moduleService.edite($scope.edite.req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                            modulesList.load(); 
                                            $('#editeModal').modal('hide');
                                        }else if(response.data.code == "003"){
                                            $scope.edite.validation.taken = true;
                                            $('#editeModal').scrollTop(0)
                                        }else {
                                            $('#editeModal').modal('hide');
                                        }
                                    },
                                    function errorCallback(response) {
                                            
                                     }
                             );
                
            },
            annuler : function(){
            }
            
        }
        $scope.$on('init_editeModal',function(event,id){
            $scope.edite.init(id);
        })
       
        $scope.$on('eModulesListUpdate',function(){
            $('.selectpicker').selectpicker()
            $('.selectpicker').selectpicker('refresh');
        })
});

app.controller('m_apercuModalController',function($scope,$rootScope,eModuleService,profService,modulesList,profsList){
    $scope.module;
    
    $scope.init = function(moduleId){
             $scope.module = modulesList.getItems()[modulesList.getSelectedItemIndex()];
              if(moduleId)
                    for(var i=0 ; i<modulesList.getItems().length ; i++){
                        if(modulesList.getItems()[i]._id == moduleId){
                            $scope.module = modulesList.getItems()[i];
                            break;
                        } 
               } 
    }
    
   
        $scope.$on('init_apercuModal',function(event,id){
            $scope.init(id);
        })
});

//element de module Controllers
app.controller('e_shareModalController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){
    $scope.profs = profsList.getItems;
    
    $scope.share = {
            req : {
                intitulee : '',
                userId : '',
                eModuleId : '',
                sendTo : []
            },
            sharedWith : '',
            currentSendTo : '',
            removeCurrentST : function(index){
                $scope.share.currentSendTo.splice(index,1);
            },
            init : function(){
                var eModule = eModulesList.getItems()[eModulesList.getSelectedItemIndex()];
                //$('.selectpicker').selectpicker('deselectAll');
                $('.selectpicker').selectpicker('refresh')
                $scope.share.req.intitulee = eModule.intitulee;
                $scope.share.req.userId = $rootScope.userId;
                $scope.share.req.eModuleId = eModule._id;
                $scope.share.req.sendTo = [];
                $scope.share.currentSendTo = eModule.sendTo;
                
                if(eModule.sendTo.length > 0)
                    $scope.share.sharedWith = 'Partgé avec :'
                for(var i=0 ; i<eModule.sendTo.length ; i++){
                         $scope.share.sharedWith = $scope.share.sharedWith.concat(' '+eModule.sendTo[i]._id.nom+',');
                }
                $scope.share.sharedWith = $scope.share.sharedWith.slice(0,-1);
                
            },
            submit : function(){
                $scope.share.req.sendTo =  $scope.share.req.sendTo.concat($scope.share.currentSendTo);
                eModuleService.share($scope.share.req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                            eModulesList.load();
                                            $('#shareModal').modal('hide');
                                        }else{
                                        }
                                    },
                                    function errorCallback(response) {
                                     }
                             );
                
            },
            annuler : function(){
            }
            
        }
        
        $scope.$on('init_shareModal',function(){
            $scope.share.init();
        })
});

app.controller('e_editeModalController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){

    $scope.edite = {
            req : {
                userId : '',
                updatedBy : '',
                eModuleId : '',
                intitulee : '',
                prerequis : '',
                objectif : '',
                volume_horaire : 
                        {
                            cour :0,
                            td : 0,
                            tp : 0
                        },
                activitees_pratique : [],
                description_programme : '', 
                modalitee_evaluation : '',
                note : '',
                status : '',
            },
            validation : {
                 taken : false,
                 WTaken : false
            },
            init : function(eModuleId){
              var tmpEModule = eModulesList.getItems()[eModulesList.getSelectedItemIndex()];
              
              if(eModuleId)
                    for(var i=0 ; i<eModulesList.getItems().length ; i++){
                        if(eModulesList.getItems()[i]._id == eModuleId){
                            tmpEModule = eModulesList.getItems()[i];
                            break;
                        } 
               }  
               
              
              $scope.edite.req.userId = $rootScope.userId;
              $scope.edite.req.updatedBy = $rootScope.userId;
              $scope.edite.req.eModuleId = tmpEModule._id;
              $scope.edite.req.intitulee = tmpEModule.intitulee;
              $scope.edite.req.prerequis = tmpEModule.prerequis;
              $scope.edite.req.objectif = tmpEModule.objectif;
              $scope.edite.req.volume_horaire = tmpEModule.volume_horaire;
              $scope.edite.req.activitees_pratique = tmpEModule.activitees_pratique;
              $scope.edite.req.description_programme = tmpEModule.description_programme;
              $scope.edite.req.modalitee_evaluation = tmpEModule.modalitee_evaluation;
              $scope.edite.req.note = tmpEModule.note;
              $scope.edite.req.status = tmpEModule.status;
              
              
            },
            addActivite : function(){
                var newActivitee = {
                            libellee : '',
                            objectif : '',
                            travaux_terrain : 0,
                            projet : 0,
                            stage : 0,
                            visite_etude : 0
                        }
                $scope.edite.req.activitees_pratique.push(newActivitee);
            }
            ,
            submit : function(){
                if(!$scope.editeForm.$pristine){
                    $scope.edite.req.lastUpdate = new Date();
                }
                eModuleService.edite($scope.edite.req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                            eModulesList.load();
                                            $('#editeModal').modal('hide');
                                        }else if(response.data.code == "003"){
                                            $scope.edite.validation.taken = true;
                                            $('#editeModal').scrollTop(0)
                                        }else {
                                            $('#editeModal').modal('hide');
                                        }
                                    },
                                    function errorCallback(response) {
                                            
                                     }
                             );
                
            },
            annuler : function(){
            }
            
        }
        $scope.$on('init_editeModal',function(event,id){
            $scope.edite.init(id);
        })
});

app.controller('e_apercuModalController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){
    $scope.eModule;
    
    $scope.init = function(eModuleId){
             $scope.eModule = eModulesList.getItems()[eModulesList.getSelectedItemIndex()];
              
              if(eModuleId)
                    for(var i=0 ; i<eModulesList.getItems().length ; i++){
                        if(eModulesList.getItems()[i]._id == eModuleId){
                            $scope.eModule = eModulesList.getItems()[i];
                            break;
                        } 
               } 
    }
    
   
        $scope.$on('init_apercuModal',function(event,id){
            $scope.init(id);
        })
});


app.controller('e_creeModalController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){
         $scope.profs = profsList.getItems;
         $scope.cree = {
            req : {
                userId : '',
                intitulee : '',
                sendTo : [],
            },
            validation : {
                 taken : false,
                 WTaken : false
            },
            init : function(){
               //$('.selectpicker').selectpicker('deselectAll');
               $('.selectpicker').selectpicker('refresh');
                
                $scope.cree.req.userId = $rootScope.userId
                $scope.cree.validation.WTaken = false;
                $scope.cree.validation.taken = false;
                $scope.cree.req.intitulee = '';
                $scope.creeEModuleForm.intitulee.$setUntouched();
                $scope.cree.req.sendTo = [];
            }
            ,
            submit : function(){
                eModuleService.cree($scope.cree.req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                            eModulesList.load();
                                            $('#creeModal').modal('hide');
                                        }else if(response.data.code == '003'){
                                            $scope.cree.validation.taken = true;
                                        }else {
                                             $('#creeModal').modal('hide');
                                        }
                                    },
                                    function errorCallback(response) {
                                     }
                             );
                
            },
            annuler : function(){

            }
        }
        
        
        $scope.$on('init_creeModal',function(){
            $scope.cree.init();
        })
        
})

app.controller('e_deleteModalController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){
     $scope.delete = {
            delete : function(){
                var id = eModulesList.getItems()[eModulesList.getSelectedItemIndex()]._id;
                var userId = $rootScope.userId;
                var intitulee = eModulesList.getItems()[eModulesList.getSelectedItemIndex()].intitulee;
                eModuleService.delete({intitulee : intitulee,eModuleId : id,userId : userId})
                               .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                         eModulesList.load();
                                        }else{

                                        }
                                    },
                                    function errorCallback(response) {
                                     }
                             );
            }
        }
});

app.controller('e_eModuleTableController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){
        $scope.selectedItemIndex = eModulesList.getSelectedItemIndex;
        $scope.getPermision = eModulesList.getPermision;
      
        $scope.eModuleTable = {
            items : eModulesList.getItems,
            search : '',
            selectedIndex : -1,
            init : function(){  
                $scope.eModuleTable.selectedIndex = -1;
                eModulesList.setSelectedItemIndex(-1);
                $scope.eModuleTable.search = '';
            },
            menuOptions : [
                ['Apercu', function($itemScope){
                    $rootScope.$broadcast('init_apercuModal',{});
                    $('#apercuModal').modal('show');
                }],
                null,
                ['Modifier',function($itemScope){
                    $rootScope.$broadcast('init_editeModal',{});
                    $('#editeModal').modal('show');
                }],
                ['Partager...',function($itemScope){
                    $scope.eModuleTable.selectedId = $itemScope.eModule._id;
                    $rootScope.$broadcast('init_shareModal',{});
                    $('#shareModal').modal('show');
                  
                }],
                null,
                ['Supprimer',function($itemScope){
                    $scope.eModuleTable.selectedId = $itemScope.eModule._id;
                    $('#deleteModal').modal('show');
                }]
            ],
            menuOptionsw : [
                ['Apercu', function($itemScope){
                    $rootScope.$broadcast('init_apercuModal',{});
                    $('#apercuModal').modal('show');
                }],
                null,
                ['Modifier',function($itemScope){
                    $rootScope.$broadcast('init_editeModal',{});
                    $('#editeModal').modal('show');
                }],
               ],
            menuOptionsr : [
                ['Apercu', function($itemScope){
                    $rootScope.$broadcast('init_apercuModal',{});
                    $('#apercuModal').modal('show');
                }],
               ],
            clicked : function(index,id,_intitulee){
                $scope.eModuleTable.selectedIndex = index;
                eModulesList.setSelectedItemIndex(index);
            }
        }

        $scope.$on('updateSearch',function(event,search){
            $scope.eModuleTable.search = search;
        })  
})

app.controller('e_headerController',function($scope,$rootScope,eModuleNotifList,profService,eModuleNotifService,eModulesList){
        $scope.selectedItemIndex = eModulesList.getSelectedItemIndex;
        $scope.getPermision = eModulesList.getPermision;
        $scope.header = {
            eModuleNotif : eModuleNotifList.getItems,
            newNotifCount : eModuleNotifList.getCount,
            init : function(){
               
            }
        }
        
        
            
        
        
        $scope.apercu = function(){
            $rootScope.$broadcast('init_apercuModal',{});
        }
        $scope.edite = function(){
            $rootScope.$broadcast('init_editeModal',{});
        }
        $scope.share = function(){
            $rootScope.$broadcast('init_shareModal',{});
        }
        $scope.cree = function(){
            $rootScope.$broadcast('init_creeModal',{});
        }
        $scope.reportChange = function(){
            $rootScope.$broadcast('updateSearch',$scope.search);
        }
        $scope.notifClick = function(notif){
            if(notif.eModule){
                $rootScope.$broadcast('init_apercuModal',notif.eModule._id);
                $('#apercuModal').modal('show');
            }
            if(notif.status == 'unseen'){
                notif.status == 'seen'
                eModuleNotifList.setCount(eModuleNotifList.getCount()-1)
                eModuleNotifService.updateNotif({notifId : notif._id,status : 'seen'})
                 .then(function(){
                })
            }
        }
});

app.controller('gestionFilierController',function($scope,$rootScope,profService,modulesList,profsList,eModulesList,eModuleNotifList,moduleNotifList){
        
        $scope.modulesList = modulesList.getItems;
        $scope.eModulesList = eModulesList.getItems;
        
        $rootScope.userId = '5773c78de27ca4e65fa8d92a'; // kotb : 5773c78de27ca4e65fa8d92a
        profsList.load().then(function(){               // Oussama : 5773c798e27ca4e65fa8d92b
            eModulesList.load().then(function(){        // yassir : 5773c7a9e27ca4e65fa8d92c
                modulesList.load().then(function(){
                    eModuleNotifList.load().then(function(){
                        moduleNotifList.load().then(function(){
                            
                        })
                    })
                })
            })
        });     
        $scope.eModuleNotifCount = eModuleNotifList.getCount;
        $scope.moduleNotifCount = moduleNotifList.getCount;  
});