'use strict';

//Home controller - Functionality of Home Page

var app = angular.module('Home', ['ui.bootstrap', 'angularUtils.directives.dirPagination'])
app.service('sharedProperties', function () {
  var property = 'https://129.213.86.196:8443/Oracle_Storage-1/storage/'; //'http://10.159.236.228:8081/Oracle_Storage/storage/';

  return {
    getProperty: function () {
      return property;
    },
    setProperty: function (value) {
      property = value;
    }
  };
});
app.controller('HomeController', ['$rootScope', '$scope', '$http', 'AuthenticationService', 'sharedProperties', '$location', '$uibModal',
  function ($rootScope, $scope, $http, AuthenticationService, sharedProperties, $location, $uibModal) {
    console.log('after authentication');
$scope.$on('LOAD',function(){$scope.loading=true});
$scope.$on('UNLOAD',function(){$scope.loading=false});
    $scope.creds = AuthenticationService.GetCredentials();
    $rootScope.clickedContainer = '';
    // console.log("getProperty in HomeController : "+sharedProperties.getProperty()+'getContainer/login');

    // calls refresh method which fetches containers in the account

    var refresh = function () {
      $scope.$emit('LOAD');
      $http({
        method: 'POST',
        url: sharedProperties.getProperty() + 'getContainer/login',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          username: $scope.creds.currentUser.username,
          password: $scope.creds.currentUser.password,
          identityDomain: $scope.creds.currentUser.identityDomain
        }
      }).then(function (response) {
        $scope.containers = response;
        $scope.$emit('UNLOAD');
      }, function (err) {
        console.log('ERR' + err);
      });
      $scope.checked_containers = [];
      console.log("container length" + $scope.checked_containers.length);
    };

    //this call makes a call to refresh method whenever the page loads
    refresh();
    

    $scope.containerClick = function (item) {
      $rootScope.clickedContainer = item;
      console.log($rootScope.clickedContainer);
      $location.path('/container');
    }
    //create the containers method
    var cc = function () {
      console.log($scope.contName);
      $http({
        method: 'POST',
        url: sharedProperties.getProperty() + 'createContainer',
        headers: {
          'Content-Type': 'application/json'
        },
        //headers:{'Access-Control-Allow-Origin':'http://PTURLAPA-US:8080/'},
        // headers:{'Origin':'http://10.63.61.252/test'},
        data: {
          "containerName": $scope.contName
        }
        //data: {username: $scope.creds.currentUser.username , password:  $scope.creds.currentUser.authdata, identityDomain: $scope.creds.currentUser.identitydomain}             	
      }).then(function (response) {
        //  $scope.containers = response;	         		   
        //  console.log($scope.containers.data.container);
        refresh()
      }, function (err) {
        console.log('ERR' + err);
      });
    };
    //deletes the containers method
    var del = function () {
      console.log($scope.checked_containers);
      var checked_cc = $scope.checked_containers;
      for (var i = 0; i < checked_cc.length; i++) {
        console.log(checked_cc[i]);
        $http({
          method: 'POST',
          url: sharedProperties.getProperty() + 'deleteContainer',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            "containerName": checked_cc[i]
          }
        }).then(function (response) {
          $scope.successMessage = $scope.checked_containers+" deleted successfully!!";
          $scope.successMessagebool = true;
          $scope.checked_containers = [];          
          refresh();
        }, function (err) {
          console.log('ERR' + err);
        });
      }

      checked_cc = null;
      $scope.checked_containers = [];
    };

    //sorts the containers in the table
    $scope.sort = function (keyname) {
      $scope.sortKey = keyname; //set the sortKey to the param passed
      $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }
    $scope.checked_containers = [];


    // create container popup
    $scope.open = function (size) {
      console.log('setting for popup');

      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'myModalContent.html',
        controller: 'ModalInstanceCtrl',
        backdrop: true,
        windowClass: 'show',
        size: size,
      });

      modalInstance.result.then(function (contName) {
        console.log('containerName to create >>' + contName);
        $scope.contName = contName;
        cc();
      });
    };


    $scope.toggleAll = function () {
      var toggleStatus = $scope.selectall;
      angular.forEach($scope.containers.data.container, function (c) {
        if (toggleStatus) {
          $scope.checked_containers.push(c.containerName);
        } else {
          $scope.checked_containers = [];
        }
      });
   }

  //delete container popup
    $scope.delete = function (size) {
      console.log('setting for popup');

      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'myModalContentDelete.html',
        controller: 'ModalInstanceCtrlDelete',
        backdrop: true,
        windowClass: 'show',
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
  }
]);
//create container popup setup with close/ok functionality
angular.module('Home').controller('ModalInstanceCtrl', function ($scope, sharedProperties, $uibModalInstance) {
  console.log("getProperty in ModalInstanceCtrl : " + sharedProperties.getProperty());
  console.log('running popup');
  $scope.ok = function () {
    $uibModalInstance.close($scope.contName);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});




angular.module('Home').controller('ModalInstanceCtrlDelete', function ($scope, sharedProperties, $uibModalInstance, checked_containers) {
  console.log('running popup');
  console.log("getProperty in ModalInstanceCtrlDelete : " + sharedProperties.getProperty());
  $scope.checked_containers = checked_containers;

  $scope.ok = function () {
    $uibModalInstance.close($scope.checked_containers);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});


//stores all the items that needs to be deleted and shows them on page.
app.directive('checkList', function () {
  return {
    scope: {
      list: '=checkList',
      value: '@'
    },
    link: function (scope, elem, attrs) {
      var handler = function (setup) {
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

      elem.on('change', function () {
        scope.$apply(changeHandler);
      });
      scope.$watch('list', setupHandler, true);
    }
  };
});

// function() {

//   $scope.containers = ([ {             
//     containerName : "TestCon2"
//   }, {

//     containerName : "TestContainer"
//   }, {

//     containerName : "_apaas"
//   }, {

//     containerName : "_developer"
//   }, {

//     containerName : "database"
//   }, {

//     containerName : "iot"
//   }, {

//     containerName : "iot2"
//   }, {

//     containerName : "iotContainer"
//   }, {

//     containerName : "jcs"
//   }, {

//     containerName : "testing1"
//   }, {

//     containerName : "testing5"
//   }, {

//     containerName : "testingPhani"
//   }

//   ]);
// };