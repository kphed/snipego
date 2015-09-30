'use strict';

angular.module('SnipeGo',
  [
  'SnipeGo.MainCtrl',
  'SnipeGo.AuthService',
  'ui.router',
  'angular-svg-round-progress'])
  .run(['$rootScope', '$location', '$http', function($rootScope, $location, $http) {
    $rootScope.$on('$stateChangeStart', function(e, toState){
      if (toState) {
        console.log('making a http get request to check for auth');
        $http.get('http://localhost:3000/users/auth/is-authenticated')
        .success(function(resp) {
          console.log('is the user authenticated?', resp);
        });
      }
    });
  }])
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'js/template/main.html',
        controller: 'MainCtrl'
      });
  });
