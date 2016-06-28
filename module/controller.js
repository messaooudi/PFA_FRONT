/* global angular */
var serverip = 'localhost'
var app = angular.module('app',['ui.bootstrap.contextMenu']);


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
                                    responseFields : 'intitulee',
                                   })
                      .then(function successCallback(response){
                               items = items.concat(response.data.data);
                              return eModuleService.load({searchQuery : {createdBy : $rootScope.userId },
                                    responseFields : 'intitulee',
                                   })
                                .then(function successCallback(response){
                                        items = items.concat(response.data.data);
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
    
    return {
        load : load,
        getItems : getItems,
        getSelectedItemIndex : getSelectedItemIndex,
        setSelectedItemIndex : setSelectedItemIndex
    }
    
});


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

app.service('profService',function($http){
    this.getProfs = function(req){
            return $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/profs/getProf',
                        data : req
                    })
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

app.service('notifList',function($rootScope,moduleNotifService){
    var items = [];
    
    var load = function(notifIds){
        return moduleNotifService.getNotif({searchQuery : {_id : {$in : notifIds}},populate : [{path : 'module',select : 'intitulee'},{path : 'eModule',select : 'intitulee'},{path : 'prof',select : 'nom'}]})
                                    .then(function successCallback(response){
                                      items = response.data.data;
                                      // $rootScope.$broadcast('notifsListUpdate',{})
                                    },function errorCallback(respnse){
                                        
                                    });
    };
    
    var getItems = function(){
        return items;
    }
    
    return {
        load : load,
        getItems : getItems
    }
})

app.service('modulesList',function(moduleService,$rootScope,$filter){
    var items = []
    var selectedItemIndex =  -1;
    
    var load = function(){
              items = [];
              return  moduleService.load({searchQuery : {/*createdBy : $rootScope.userId ,*/'coordonnateur' :{ $in : [$rootScope.userId]}},
                                    responseFields : '',
                                    populate : [{path : 'createdBy',select : 'nom'},{path : 'updatedBy',select : 'nom'}]})
                      .then(function successCallback(response){
                               items = items.concat(response.data.data);
                              return moduleService.load({searchQuery : {createdBy : $rootScope.userId },
                                    responseFields : '',
                                    populate : [{path : 'createdBy',select : 'nom'},{path : 'updatedBy',select : 'nom'}]})
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
    
    return {
        load : load,
        getItems : getItems,
        getSelectedItemIndex : getSelectedItemIndex,
        setSelectedItemIndex : setSelectedItemIndex
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


app.controller('creeModalController',function($scope,$rootScope,moduleService,profService,modulesList,profsList){
         $scope.profs = profsList.getItems();
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
                                            $rootScope.$broadcast('updateTable',{});
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
        
        $rootScope.$on('profsListUpdate',function(){
            $scope.profs = profsList.getItems();
        })
        
        $scope.$on('init_creeModal',function(){
            $scope.cree.init();
        })
        
})

app.controller('headerController',function($scope,$rootScope,notifList,profService,moduleNotifService,modulesList){
        $scope.header = {
            moduleNotif : [],
            newNotifCount : 0,
            init : function(){
                   profService.getProfs({searchQuery :{ _id : $rootScope.userId},responseFields : 'notification.moduleNotif'})
                    .then(function successCallback(response){
                                notifList.load(response.data.data[0].notification.moduleNotif)
                                   .then(function(){
                                       $scope.header.moduleNotif = notifList.getItems();
                                       for(var i=0 ; i< $scope.header.moduleNotif.length ; i++){
                                           if($scope.header.moduleNotif[i].status == 'unseen')
                                                $scope.header.newNotifCount++;
                                       }
                                   })
                            },
                            function errorCallback(response) {
                                
                            }
                      );
            }
        }
        
        $scope.getPermision = function(moduleId){
            for(var i=0 ; i<modulesList.getItems().length ; i++){
                if(modulesList.getItems()[i]._id == moduleId){
                    for(var j = 0 ; j<modulesList.getItems()[i].sendTo.length ; j++ ){
                        if(modulesList.getItems()[i].sendTo[j]._id._id == $rootScope.userId){
                            return modulesList.getItems()[i].sendTo[j].permision;
                        }
                    }
                }
            } 
        }
        
        $rootScope.$on('notifsListUpdate',function(){
            $scope.header.eModuleNotif = notifList.getItems();
        })
        
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
                $scope.header.newNotifCount--;
                moduleNotifService.updateNotif({notifId : notif._id,status : 'seen'})
                                   .then(function(){
                })
            }
        }
});

app.controller('moduleTableController',function($scope,$rootScope,moduleService,profService,modulesList,profsList){
        
        
        $scope.moduleTable = {
            items : '',
            search : '',
            selectedIndex : -1,
            init : function(){  
                $scope.moduleTable.selectedIndex = -1;
                modulesList.setSelectedItemIndex(-1);
                $scope.moduleTable.search = '';
                modulesList.load();
                //$scope.moduleTable.items = modulesList.getItems();
            },
            menuOptions : [
                ['Apercu', function($itemScope){
                    alert($itemScope.eModule.intitulee)
                }],
                ['Afficher les détails', function($itemScope){
                    alert($itemScope.eModule.intitulee)
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
            clicked : function(index,id,_intitulee){
                $scope.moduleTable.selectedIndex = index;
                modulesList.setSelectedItemIndex(index);
            }
        }
       
        $scope.$on('moduleListUpdate',function(){
             $scope.moduleTable.items = modulesList.getItems();
        })
        
       
        $scope.$on('updateTable',function(){
            $scope.moduleTable.init();
        })  
        $scope.$on('updateSearch',function(event,search){
            $scope.moduleTable.search = search;
        })  
})

app.controller('deleteModalController',function($scope,$rootScope,moduleService,profService,modulesList,profsList){
     $scope.delete = {
            delete : function(){
                var id = modulesList.getItems()[modulesList.getSelectedItemIndex()]._id;
                var userId = $rootScope.userId;
                var intitulee = modulesList.getItems()[modulesList.getSelectedItemIndex()].intitulee;
                moduleService.delete({intitulee : intitulee,moduleId : id,userId : userId})
                               .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                         $rootScope.$broadcast('updateTable',{});
                                        }else{

                                        }
                                    },
                                    function errorCallback(response) {
                                     }
                             );
            }
        }
});

app.controller('editeModalController',function($scope,$rootScope,moduleService,profService,modulesList,profsList,eModulesList){
    $scope.eModules = eModulesList.getItems();
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
              $scope.edite.req.eModules = tmpModule.eModules;              
              
              $('.selectpicker').selectpicker()
              $('.selectpicker').selectpicker('refresh');
            },
           submit : function(){
                if(!$scope.editeForm.$pristine){
                    $scope.edite.req.lastUpdate = new Date();
                }
                moduleService.edite($scope.edite.req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                            $rootScope.$broadcast('updateTable',{});
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
            $scope.eModules = eModulesList.getItems();
            $('.selectpicker').selectpicker('refresh');
        })
});

app.controller('gestionFilierController',function($scope,$rootScope,moduleService,profService,modulesList,profsList,eModulesList){
        $scope.selectedItemIndex = modulesList.getSelectedItemIndex;
        $scope.modulesList = modulesList.getItems;
        $rootScope.userId = '576f01b77bdb34164409a889'; //576f01b77bdb34164409a889 576f01bf7bdb34164409a88b
        profsList.load();
        eModulesList.load();
                
});