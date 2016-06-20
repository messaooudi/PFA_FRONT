
/* global angular */
var serverip = 'localhost'
var app = angular.module('app',['ui.bootstrap.contextMenu']);

app.run(function($rootScope){
    $rootScope.selectedEModuleId = -1;
    $rootScope.eModuleCreated = -1;
    $rootScope.eModuleDeleted = -1;
});

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

app.service('profService',function($http){
    this.getProfs = function(req){
            return $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/profs/getProf',
                        data : req
                    })
    }
});



app.service('eModulesList',function(eModuleService,$rootScope){
    var items = []
    var selectedItemIndex =  -1;
    var load = function(){
               return eModuleService.load({searchQuery : {createdBy : $rootScope.userId /*,'sendTo.id' :{ $in : [$rootScope.userId]}*/},
                                    responseFields : '',
                                    populate : [{path : 'createdBy',select : 'nom'},{path : 'updatedBy',select : 'nom'}]})
                      .then(function successCallback(response){
                               items = response.data.data;
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

app.service('profsList',function(profService){
    var items = [{id : '57661a48f9fa1f87bed667da',nom : "Oussama"},
                 {id : '57677729385118cd7efd33a2',nom : "Kotb"},
                 {id : '5767fbc190d865945c11f0e9',nom : 'Yassir'}
                ]
    var load = function(){
            return profService.getProfs({})
                    .then(function successCallback(response){
                                 this.items = response.data.data;
                            },
                            function errorCallback(response) {
                                
                            }
                      );

                
            }
    var getItems = function(){
        return items;
    }
    
    return {
        load : load,
        getItems : getItems
    }
});

app.controller('shareModalController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){
    $scope.profs = profsList.getItems();
    $scope.share = {
            req : {
                userId : '',
                eModuleId : '',
                sendTo : []
            },
            sharedWith : '',
            init : function(){
                $('.selectpicker').selectpicker('deselectAll');
                $('.selectpicker').selectpicker('refresh')

                $scope.share.req.userId = $rootScope.userId;
                $scope.share.req.eModuleId = eModulesList.getItems()[eModulesList.getSelectedItemIndex()]._id;
                $scope.share.sharedWith = '';
                $scope.share.req.sendTo = [];
                
                
                var req = {userId : $rootScope.userId,
                          searchQuery : {_id : eModulesList.getItems()[eModulesList.getSelectedItemIndex()]._id},
                          responseFields : "sendTo.id",
                          populate : [{path : 'sendTo.id',select : 'nom'}]};
                eModuleService.load(req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                            if(response.data.data[0].sendTo.length>0)
                                                $scope.share.sharedWith = "Partagé avec :"
                                            for(var i=0 ; i<response.data.data[0].sendTo.length ; i++){
                                               $scope.share.sharedWith = $scope.share.sharedWith.concat(' '+response.data.data[0].sendTo[i].id.nom+',');
                                            }
                                            $scope.share.sharedWith = $scope.share.sharedWith.slice(0,-1);
                                        }else{
                                        }
                                    },
                                    function errorCallback(response) {
                                    }
                              );
            },
            submit : function(){
                eModuleService.share($scope.share.req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
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

app.controller('editeModalController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){

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
            },
            validation : {
                 taken : false,
                 WTaken : false
            },
            init : function(){

              var tmpEModule = eModulesList.getItems()[eModulesList.getSelectedItemIndex()];
              
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
                                            $rootScope.$broadcast('updateTable',{});
                                            $('#editeModal').modal('hide');
                                        }else if(response.data.code == "003"){
                                            $scope.edite.validation.taken = true;
                                            $('#editeModal').scrollTop(0)
                                        }
                                    },
                                    function errorCallback(response) {
                                            
                                     }
                             );
                
            },
            annuler : function(){
            }
            
        }
        $scope.$on('init_editeModal',function(){
            $scope.edite.init();
        })
});

app.controller('creeModalController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){
         $scope.profs = profsList.getItems();
         $scope.cree = {
            req : {
                userId : '',
                intitulee : '',
                sendTo : [],
                populate : []
            },
            validation : {
                 taken : false,
                 WTaken : false
            },
            init : function(){
                $('.selectpicker').selectpicker('deselectAll');
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
                                            $rootScope.$broadcast('updateTable',{});
                                            $('#creeModal').modal('hide');
                                        }else{
                                            $scope.cree.validation.taken = true;
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

app.controller('deleteModalController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){
     $scope.delete = {
            delete : function(){
                var id = eModulesList.getItems()[eModulesList.getSelectedItemIndex()]._id;
                var userId = $rootScope.userId;
                eModuleService.delete({eModuleId : id,userId : userId})
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

app.controller('eModuleTableController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){
        
        
        $scope.eModuleTable = {
            items : '',
            search : '',
            selectedIndex : -1,
            init : function(){  
                $scope.eModuleTable.selectedIndex = -1;
                eModulesList.setSelectedItemIndex(-1);
                $scope.eModuleTable.search = '',
                eModulesList.load().then(function(){
                    $scope.eModuleTable.items = eModulesList.getItems();
                });
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
            clicked : function(index,id,_intitulee){
                $scope.eModuleTable.selectedIndex = index;
                eModulesList.setSelectedItemIndex(index);
            }
        }
       
        $scope.$on('updateTable',function(){
            $scope.eModuleTable.init();
        })  
        $scope.$on('updateSearch',function(event,search){
            $scope.eModuleTable.search = search;
        })  
})

app.controller('headerController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){
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
});
app.controller('gestionFilierController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){
       
        $rootScope.userId = profsList.getItems()[0].id;
        $scope.selectedItemIndex = eModulesList.getSelectedItemIndex;
        $scope.eModulesList = eModulesList.getItems;        
});


/*
app.controller('creeEModuleConttroler',function($scope,$rootScope,eModuleService){
    
        $scope.profs = [
            {
                nom : "kotb",
                id : "573a1790a72c2597d03f7d8f",
            },
            {
                nom : "oussama",
                id : "573a178ca72c2597d03f7d8e",
            }
        ];
        
        $scope.sendToItem = []
        
        $scope.req = {
            intitulee : '',
            sendTo : [],
            userId : '573a1790a72c2597d03f7d8f'
        }
        
        $scope.create = function(){
            for(var i = 0;i<$scope.sendToItem.length;i++){
                $scope.req.sendTo.push({id : $scope.sendToItem[i].id,permision : $scope.sendToItem[i].permision })
            }
            
            eModuleService.creeEModule($scope.req)
                .then(function successCallback(response) {
                     $('#creeModal').modal('hide');
                     $rootScope.eModuleCreated +=1;
                }, function errorCallback(response) {
                });
        }
        
})

app.controller('deleteEModuleConttroler',function($scope,$rootScope,eModuleService){
    $scope.deleteEModule = function(){
        eModuleService.deleteEModule({eModuleId : $rootScope.selectedEModuleId})
                    .then(function successCallback(response) {
                        $rootScope.eModuleDeleted+=1;
                     }, function errorCallback(response) {       
                     });;
    }
});

app.controller('EModuleTableController',function($scope,$rootScope,eModuleService){
    
     $scope.$watch('$root.eModuleCreated',function(newVal,oldVal){
         if(newVal > oldVal){
              eModuleService.loadEModules({fields : "intitulee createdBy lastUpdate updatedBy"})
                .then(function successCallback(response) {
                     $scope.eModules = response.data.data;
                }, function errorCallback(response) {
                     
                });
         }
                
     });
     
     $scope.$watch('$root.eModuleDeleted',function(newVal,oldVal){
         if(newVal > oldVal){
              eModuleService.loadEModules({fields : "intitulee createdBy lastUpdate updatedBy"})
                .then(function successCallback(response) {
                     $scope.eModules = response.data.data;
                }, function errorCallback(response) {
                     
                });
         }
                
     });
     
   
     
     $scope.eModules =[];
     eModuleService.loadEModules({fields : "intitulee createdBy lastUpdate updatedBy"})
                .then(function successCallback(response) {
                     $scope.eModules = response.data.data;
                }, function errorCallback(response) {
                     
                });
});

app.controller('navController',function($scope,eModuleService){
    
});

app.controller('shareEModuleConttroler',function($scope,$rootScope,eModuleService){
    $scope.profs = [
            {
                nom : "kotb",
                id : "573a1790a72c2597d03f7d8f",
            },
            {
                nom : "oussama",
                id : "573a178ca72c2597d03f7d8e",
            }
        ];
    
    $scope.sendToItem = []

        $scope.req = {
            eModuleId : $rootScope.selectedEModuleId,
            sendTo : [],
            userId : '573a1790a72c2597d03f7d8f'
        }
    
    $scope.partger = function(){
        $scope.req.eModuleId =  $rootScope.selectedEModuleId;
        for(var i = 0;i<$scope.sendToItem.length;i++){
                $scope.req.sendTo.push({id : $scope.sendToItem[i].id,permision : $scope.sendToItem[i].permision })
            }
        eModuleService.shareEModule($scope.req)
            .then(function successCallback(response) {

                }, function errorCallback(response) {
                     
                });
        
        
    }
});
*/