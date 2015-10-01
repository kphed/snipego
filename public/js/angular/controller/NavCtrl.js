'use strict';

angular.module('SnipeGo.NavCtrl', ['SnipeGo', 'SnipeGo.Services'])
  .controller('NavCtrl', ['$scope', 'Auth', function($scope, Auth) {

    $scope.isAuth = false;

    $scope.firstName = "Khoa";

    $scope.profilePic = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/62/626d9a8ffbe54581cb92c7a9e0cd7b2dba730e14.jpg';

    $scope.checkAuth = function() {
      console.log('calling check auth');
      Auth.checkSession().success(function(resp) {
        console.log('resp is ', resp);
        if (resp) {
          $scope.isAuth = true;
        } else {
          console.log('no resp');
        }
      });
    };

    $scope.checkAuth();
  }]
);
