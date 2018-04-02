'use strict';

// declare modules
angular.module('Authentication', []);
angular.module('Home', []);

angular.module('BasicHttpAuthExample', [
    'Authentication',
    'Home',
    'ngRoute',
    'ngCookies'
])
 
.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
console.log('deciding route');
    $routeProvider
        .when('/login', {
            controller: 'LoginController',
            templateUrl: '/login/modules/authentication/views/login.html',
            hideMenus: true
        })
 
        .when('/', {
            controller: 'HomeController',
            templateUrl: '/login/modules/home/views/home.html'
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