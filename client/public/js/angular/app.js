'use strict';

angular.module('SnipeGo',
  ['irontec.simpleChat',
  'SnipeGo.Directives.Popover',
  'SnipeGo.Directives.ToggleClass',
  'SnipeGo.MainCtrl',
  'SnipeGo.NavCtrl',
  'SnipeGo.DepositCtrl',
  'SnipeGo.Services',
  'ui.router',
  'firebase',
  'angular-svg-round-progress'])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
      .state('main', {
        url: '/',
        views: {
          '': {
          templateUrl: 'js/template/main.html',
          controller: 'MainCtrl',
          },
          'nav': {
            templateUrl: 'js/template/nav.html',
            controller: 'NavCtrl'
          }
        }
      });
  }]);

