'use strict';
 
var app =  angular.module('Home', ['ui.bootstrap'])
 
app.controller('HomeController',
    ['$scope', '$http', 'AuthenticationService', '$uibModal',
    function ($scope, $http, AuthenticationService, $uibModal) {
      console.log('after authentication');
        $scope.creds = AuthenticationService.GetCredentials();
       
        var refresh = function(){
        $http({
          method: 'POST',
          url: 'http://192.168.56.1:8081/Oracle_Storage/storage/getContainer/login',
          headers: {'Content-Type': 'application/json'},
          //headers:{'Access-Control-Allow-Origin':'http://PTURLAPA-US:8080/'},
         // headers:{'Origin':'http://localhost/test'},
          data: {username: 'vijaya.vishwanath@oracle.com' , password:  'Yellow99', identityDomain: 'gse00013232'}             	
          //data: {username: $scope.creds.currentUser.username , password:  $scope.creds.currentUser.authdata, identityDomain: $scope.creds.currentUser.identitydomain}             	
        }).then(function(response) {
             $scope.containers = response;	         		   
             console.log($scope.containers.data.container);
         }, function(err) {
             console.log('ERR'+err);
        });
        $scope.checked_containers = [];
       };

       var cc = function(){
         console.log($scope.contName);
        $http({
          method: 'POST',
          url: 'http://192.168.56.1:8081/Oracle_Storage/storage/createContainer',
          headers: {'Content-Type': 'application/json'},
          //headers:{'Access-Control-Allow-Origin':'http://PTURLAPA-US:8080/'},
         // headers:{'Origin':'http://localhost/test'},
          data: {"containerName" :  $scope.contName}             	
          //data: {username: $scope.creds.currentUser.username , password:  $scope.creds.currentUser.authdata, identityDomain: $scope.creds.currentUser.identitydomain}             	
        }).then(function(response) {
            //  $scope.containers = response;	         		   
            //  console.log($scope.containers.data.container);
             refresh()
         }, function(err) {
             console.log('ERR'+err);
        });
       };

       var del = function(){
        console.log($scope.checked_containers);
        var checked_cc = $scope.checked_containers;
        for (var i=0; i<checked_cc.length; i++) {
            console.log(checked_cc[i]);
            $http({
              method: 'POST',
              url: 'http://192.168.56.1:8081/Oracle_Storage/storage/deleteContainer',
              headers: {'Content-Type': 'application/json'},
              //headers:{'Access-Control-Allow-Origin':'http://PTURLAPA-US:8080/'},
             // headers:{'Origin':'http://localhost/test'},
              data: {"containerName" :  checked_cc[i]}             	
              //data: {username: $scope.creds.currentUser.username , password:  $scope.creds.currentUser.authdata, identityDomain: $scope.creds.currentUser.identitydomain}             	
            }).then(function(response) {
                //  $scope.containers = response;	         		   
                //  console.log($scope.containers.data.container);
                 refresh()
             }, function(err) {
                 console.log('ERR'+err);
            });
        }

        checked_cc=null;
        $scope.checked_containers = [];
      };

       refresh();



          //$scope.items = ['item1', 'item2', 'item3'];
          $scope.checked_containers = [];
          
          $scope.open = function (size) {
            console.log('setting for popup');
        
            var modalInstance = $uibModal.open({
              animation: true,
              ariaLabelledBy: 'modal-title',
              ariaDescribedBy: 'modal-body',
              templateUrl: 'myModalContent.html',
              controller: 'ModalInstanceCtrl',
              backdrop: true,
              windowClass : 'show',
              size: size,
              // resolve: {
              //   items: function () {
              //     //return $scope.items;
              //   }
              // }
            });
        
            modalInstance.result.then(function (contName) {
              console.log('containerName to create >>' + contName);
              $scope.contName = contName;
              cc();
            });
          };
          
          $scope.delete = function (size) {
            console.log('setting for popup');
            
            var modalInstance = $uibModal.open({
              animation: true,
              ariaLabelledBy: 'modal-title',
              ariaDescribedBy: 'modal-body',
              templateUrl: 'myModalContentDelete.html',
              controller: 'ModalInstanceCtrlDelete',
              backdrop: true,
              windowClass : 'show',
              size: size,
              resolve: {
                checked_containers: function () {
                  return $scope.checked_containers;
                }
              }
            });
        
            modalInstance.result.then(function (checked_containers) {
              console.log('containerName to delete >>' + checked_containers);
              $scope.checked_containers = checked_containers;
              del();
            });
          };
    }]);



    angular.module('Home').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {
      console.log('running popup');
        $scope.ok = function () {
           $uibModalInstance.close($scope.contName);
        };
      
        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };
      });

      angular.module('Home').controller('ModalInstanceCtrlDelete', function ($scope, $uibModalInstance, checked_containers) {
        console.log('running popup');
        $scope.checked_containers = checked_containers;
       
          $scope.ok = function () {
             $uibModalInstance.close($scope.checked_containers);
          };
        
          $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
          };
        });

app.directive('checkList', function() {
          return {
            scope: {
              list: '=checkList',
              value: '@'
            },
            link: function(scope, elem, attrs) {
              var handler = function(setup) {
                var checked = elem.prop('checked');
                var index = scope.list.indexOf(scope.value);
        
                if (checked && index == -1) {
                  if (setup) elem.prop('checked', false);
                  else scope.list.push(scope.value);
                } else if (!checked && index != -1) {
                  if (setup) elem.prop('checked', true);
                  else scope.list.splice(index, 1);
                }
              };
              
              var setupHandler = handler.bind(null, true);
              var changeHandler = handler.bind(null, false);
                    
              elem.on('change', function() {
                scope.$apply(changeHandler);
              });
              scope.$watch('list', setupHandler, true);
            }
          };
        });