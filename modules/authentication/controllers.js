'use strict';
 
angular.module('Authentication')
 
.controller('LoginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService',
    function ($scope, $rootScope, $location, AuthenticationService) {
        $scope.login = function () {
            $scope.dataLoading = true;
            AuthenticationService.SetCredentials($scope.username, $scope.password, $scope.identityDomain);
            $location.path('/home');
        };
    }]);