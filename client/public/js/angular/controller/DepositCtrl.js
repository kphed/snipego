'use strict';

angular.module('SnipeGo.DepositCtrl', ['SnipeGo', 'SnipeGo.Services'])
  .controller('DepositCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {
     $scope.grabInventory = function() {
      console.log('calling grab inventory', $rootScope.user);
      $http.get('/users/inventory')
        .success(function(resp) {
          console.log('here is your response', resp);
        });
    };
  }]
);
