'use strict';

angular.module('SnipeGo',
  ['SnipeGo.MainCtrl',
  'SnipeGo.NavCtrl',
  'SnipeGo.DepositCtrl',
  'SnipeGo.Services',
  'SnipeGo.Directives.Popover',
  'SnipeGo.Directives.ToggleClass',
  'ui.router',
  'firebase',
  'angular-svg-round-progress',
  'irontec.simpleChat'])
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
      .state('main', {
        url: '/',
        views: {
          '': {
          templateUrl: 'js/template/main.html',
          controller: 'MainCtrl',
          },
          'deposit': {
            templateUrl: 'js/template/deposit.html',
            controller: 'DepositCtrl'
          },
          'nav': {
            templateUrl: 'js/template/nav.html',
            controller: 'NavCtrl'
          }
        }
      });
  });
