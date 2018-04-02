'use strict'

angular.module('Authentication').factory(['AuthenticationService', '$rootScope' , function($rootScope){
 var service = {};
    service.SetCredentials = function (username, password) {
         
                    $rootScope.globals = {
                        currentUser: {
                            username: username,
                            password: password
                        }
                    };
         
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
                    $cookieStore.put('globals', $rootScope.globals);
                };

    // this.username = "";
    // this.password ="";
    // this.identitydomain = "";
}])