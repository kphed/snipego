'use strict';

angular.module('SnipeGo',
  [
  'SnipeGo.MainCtrl',
  'ui.router',
  'angular-svg-round-progress'])
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'js/template/main.html',
        controller: 'MainCtrl'
      });
  });
