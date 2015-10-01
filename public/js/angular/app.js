'use strict';

angular.module('SnipeGo',
  ['SnipeGo.MainCtrl',
  'SnipeGo.NavCtrl',
  'SnipeGo.Services',
  'ui.router',
  'angular-svg-round-progress'])
  // .run(['$rootScope', '$location', '$http', function($rootScope, $location, $http) {
  //   $rootScope.$on('$stateChangeStart', function(e, toState){

  //   });
  // }])
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'js/template/main.html',
        controller: 'MainCtrl'
      });
  });
