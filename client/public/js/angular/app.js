'use strict';

angular.module('SnipeGo',
  ['SnipeGo.Directives.Popover',
  'SnipeGo.Directives.ToggleClass',
  'SnipeGo.MainCtrl',
  'SnipeGo.NavCtrl',
  'SnipeGo.DepositCtrl',
  'SnipeGo.Services',
  'ui.router',
  'firebase',
  'angular-svg-round-progress',
  'irontec.simpleChat'])
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
  }])
  .filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});

