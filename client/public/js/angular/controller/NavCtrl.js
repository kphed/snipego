'use strict';

angular.module('SnipeGo.NavCtrl', ['SnipeGo', 'SnipeGo.Services'])
  .controller('NavCtrl', ['$scope', '$rootScope', 'Auth', '$http', function($scope, $rootScope, Auth, $http) {

    $scope.successDanger = 'danger';

    $scope.isAuth = false;

    $scope.tradeUrlSuccess = false;

    $scope.profilePic = '';

    $scope.tradeUrl = 'Add trade URL to unlock jackpot deposits';

    $scope.playDestination = '#tradeurl';

    $scope.updateTradeUrl = function() {
      if (!$scope.tradeUrl.match(/partner/i) || !$scope.tradeUrl.match(/token/i)) {
        $scope.tradeUrl = 'Invalid trade Url, please try again';
      } else {
      $http.post('/users/update-trade-url', {tradeUrl: $scope.tradeUrl})
        .success(function(resp) {
          $scope.playDestination = '#deposit';
          $scope.successDanger = 'success';
          $scope.tradeUrlSuccess = true;
        });
      }
    };

    $scope.clearPlaceholder = function() {
      $scope.tradeUrl = '';
    };

    $scope.checkAuth = function() {
      Auth.checkSession().success(function(resp) {
        if (resp) {
          $scope.profilePic = resp.photos[1];
          $scope.isAuth = true;
          $rootScope.user = resp;
          if (resp.tradeUrl) {
            $scope.successDanger = 'success';
            $scope.playDestination = '#deposit';
          }
        }
      });
    };

    $scope.checkAuth();

  }]
);
