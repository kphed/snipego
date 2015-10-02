'use strict';

angular.module('SnipeGo',
  ['SnipeGo.MainCtrl',
  'SnipeGo.NavCtrl',
  'SnipeGo.DepositCtrl',
  'SnipeGo.Services',
  'ui.router',
  'angular-svg-round-progress'])
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'js/template/main.html',
        controller: 'MainCtrl'
      })
      .state('deposit', {
        url: '/deposit',
        templateUrl: 'js/template/deposit.html',
        controller: 'DepositCtrl'
      });
  });
