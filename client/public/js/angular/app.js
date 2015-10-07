'use strict';

angular.module('SnipeGo',
  ['SnipeGo.MainCtrl',
  'SnipeGo.NavCtrl',
  'SnipeGo.DepositCtrl',
  'SnipeGo.Services',
  'ui.router',
  'firebase',
  'angular-svg-round-progress',
  'snap',
  'irontec.simpleChat'])
  .config(function($stateProvider, $urlRouterProvider, snapRemoteProvider) {
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

    snapRemoteProvider.globalOptions = {
      disable: 'right',
      touchToDrag:false,
      tapToClose:false,
      maxPosition: 350,
      minPosition: -350
    };
  });
