'use strict';

angular.module('SnipeGo.NavCtrl', ['SnipeGo', 'SnipeGo.Services'])
  .controller('NavCtrl', ['$scope', '$rootScope', 'Auth', '$http', function($scope, $rootScope, Auth, $http) {

    $scope.successDanger = 'success';

    $scope.isAuth = false;

    $scope.profilePic = '';

    $scope.tradeUrl = 'Add trade URL to unlock jackpot deposits';

    $scope.hasTradeUrl = '#tradeurl';

    $scope.clearPlaceholder = function() {
      $scope.tradeUrl = '';
    };

    $scope.updateTradeUrl = function() {
      console.log('update trade url');
      if ($scope.tradeUrl.length < 60 || !$scope.tradeUrl.match(/partner/i) || !$scope.tradeUrl.match(/token/i)) {
        $scope.tradeUrl = 'Invalid trade Url, please try again';
      } else {
      $http.post('/users/update-trade-url', {tradeUrl: $scope.tradeUrl})
        .success(function(resp) {
          $scope.hasTradeUrl = '#deposit';
        });
      }
    };

    $scope.checkAuth = function() {
      Auth.checkSession().success(function(resp) {
        if (resp) {
          $scope.profilePic = resp.photos[1];
          $scope.isAuth = true;
          $rootScope.user = resp;
          if (resp.tradeUrl) {
            $scope.hasTradeUrl = '#deposit';
          }
        } else {
          console.log('there was no resp???');
        }
      });
    };

    $scope.checkAuth();
  }]
);
