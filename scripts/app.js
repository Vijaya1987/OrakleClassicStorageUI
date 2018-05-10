'use strict';

// declare modules
angular.module('Authentication', []);
angular.module('Home', []);
angular.module('Container', []);

angular.module('BasicHttpAuthExample', [
    'Authentication',
    'Home',
    'Container',
    'ngRoute',
    'ngCookies'
])

.factory('httpRequestInterceptor', ['$rootScope', '$location', function ($rootScope, $location) {
    return {
        request: function ($config) {
            $('.loader').show();
            return $config;
        },
        response: function ($config) {
            $('.loader').hide();
            return $config;
        },
        responseError: function (response) {
            return response;
        }
    };
}])

.config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
console.log('deciding route');
$httpProvider.interceptors.push('httpRequestInterceptor');
    $routeProvider
        .when('/login', {
            controller: 'LoginController',
            templateUrl: '/login/modules/authentication/views/login.html',
            hideMenus: true
        })
 
        .when('/home', {
            controller: 'HomeController',
            templateUrl: '/login/modules/home/views/home.html'
        })

        .when('/container', {
            controller: 'ContainerController',
            templateUrl: '/login/modules/container/views/container.html'
        })
 
        .otherwise({ redirectTo: '/login' });
        $locationProvider.html5Mode({
            enabled: true,
            requireBase:false
        });
}])
 
// .run(['$rootScope', '$location', '$cookieStore', '$http',
//     function ($rootScope, $location, $cookieStore, $http) {
//         // keep user logged in after page refresh
//         $rootScope.globals = $cookieStore.get('globals') || {};
//         if ($rootScope.globals.currentUser) {
//             $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
//         }
 
//         $rootScope.$on('$locationChangeStart', function (event, next, current) {
//             // redirect to login page if not logged in
//             if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
//                 $location.path('/login');
//             }
//         });
//     }]);