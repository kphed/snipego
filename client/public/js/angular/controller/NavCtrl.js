'use strict';

angular.module('SnipeGo.NavCtrl', ['SnipeGo', 'SnipeGo.Services'])
  .controller('NavCtrl', ['$scope', '$rootScope', 'Auth', function($scope, $rootScope, Auth) {

    $scope.playStop = 'play';

    $scope.successDanger = 'success';

    $scope.isAuth = false;

    $scope.profilePic = '';

    $scope.checkAuth = function() {
      Auth.checkSession().success(function(resp) {
        if (resp) {
          $scope.profilePic = resp.photos[1];
          $scope.isAuth = true;
          $rootScope.user = resp;
        } else {
          console.log('there was no resp');
        }
      });
    };

    $scope.togglePlay = function() {
      if ($scope.playStop === 'play') {
        $scope.playStop = 'stop';
        $scope.successDanger = 'danger';
      } else {
        $scope.playStop = 'play';
        $scope.successDanger = 'success';
      }
    };

    $scope.checkAuth();
  }]
);
