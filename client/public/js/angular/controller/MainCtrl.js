'use strict';

angular.module('SnipeGo.MainCtrl', ['SnipeGo'])
  .controller('MainCtrl', ['$scope', '$window', function($scope, $window) {

    $scope.radius = '200';

    $scope.getStyle = function() {
      var transform = 'translateY(-50%) ' + 'translateX(-50%)';
      return {
          'top': '33%',
          'bottom': 'auto',
          'left': '50%',
          'transform': transform,
          '-moz-transform': transform,
          '-webkit-transform': transform,
          'font-size': 75 + 'px'
      };
    };

    // $scope.vm = this;

  $scope.messages = [
    {
      'username': 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/62/626d9a8ffbe54581cb92c7a9e0cd7b2dba730e14.jpg',
      'content': 'Hi!'
    },
  ];

  $scope.username = 'username1';

  $scope.sendMessage = function(message, username) {
    if(message && message !== '' && username) {
      $scope.messages.push({
        'username': 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/62/626d9a8ffbe54581cb92c7a9e0cd7b2dba730e14.jpg',
        'content': message
      });
    }
  };
  $scope.visible = true;
  $scope.expandOnNew = true;

  }]
);
