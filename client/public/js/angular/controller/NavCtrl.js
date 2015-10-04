'use strict';

angular.module('SnipeGo.NavCtrl', ['SnipeGo', 'SnipeGo.Services'])
  .controller('NavCtrl', ['$scope', '$rootScope', 'Auth', function($scope, $rootScope, Auth) {

    $scope.isAuth = false;

    $scope.profilePic = '';

    $scope.checkAuth = function() {
      console.log('calling check auth...');
      Auth.checkSession().success(function(resp) {
        console.log('resp is ', resp);
        if (resp) {
          $scope.profilePic = resp.photos[0].value;
          $scope.isAuth = true;
          $rootScope.user = resp;
        } else {
          console.log('there was no resp');
        }
      });
    };

    $scope.checkAuth();
  }]
);
