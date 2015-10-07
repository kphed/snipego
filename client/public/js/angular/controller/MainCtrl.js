'use strict';

angular.module('SnipeGo.MainCtrl', ['SnipeGo'])
  .controller('MainCtrl', ['$scope', '$firebaseArray', '$rootScope', '$window', function($scope, $firebaseArray, $rootScope, $window) {

    var ref = new Firebase('https://flickering-inferno-567.firebaseio.com/messages');

    $scope.messages = $firebaseArray(ref);
    $scope.visible = true;
    $scope.expandOnNew = true;

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

    $scope.sendMessage = function(message) {
      console.log($scope.messages);
      if(message && message !== '' && $rootScope.user) {
        $scope.messages.$add({
          'username': $rootScope.user.photos[0],
          'content': message
        });
      } else {
        $window.alert('There was an error sending your message. Please sign in or try again later.');
      }
    };

    }]
);
