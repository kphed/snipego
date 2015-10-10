'use strict';

angular.module('SnipeGo.MainCtrl', ['SnipeGo'])
  .controller('MainCtrl', ['$scope', '$firebaseArray', '$firebaseObject', '$rootScope', '$window', function($scope, $firebaseArray, $firebaseObject, $rootScope, $window) {

    var messagesRef = new Firebase('https://snipego.firebaseio.com/messages');

    var jackpotRef = new Firebase('https://snipego.firebaseio.com/currentJackpot');

    $scope.messages = $firebaseArray(messagesRef);
    $scope.visible = true;
    $scope.expandOnNew = true;

    $scope.jackpotPlayers = {};

    $scope.jackRef = $firebaseObject(jackpotRef);

    $scope.handleJackpotPlayers = function(players) {
      $scope.jackpotPlayers = players;
    };

    $scope.jackRef.$watch(function(qwe, web) {
      $scope.jackRef.$loaded().then(function() {
        var obj = {};
        for (var key in $scope.jackRef.players) {
          obj[key] = $scope.jackRef.players[key];
        }
        $scope.handleJackpotPlayers(obj);
      });
    });

    $scope.getStyle = function() {
      var transform = 'translateY(-50%) ' + 'translateX(-50%)';
      return {
        'top': '36%',
        'bottom': 'auto',
        'left': '50%',
        'transform': transform,
        '-moz-transform': transform,
        '-webkit-transform': transform,
        'font-size': 75 + 'px',
      };
    };

    $scope.sendMessage = function(message) {
      if (message && message !== '' && $rootScope.user) {
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
