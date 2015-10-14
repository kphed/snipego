'use strict';

angular.module('SnipeGo.MainCtrl', ['SnipeGo'])
  .controller('MainCtrl', ['$scope', '$firebaseArray', '$firebaseObject', '$rootScope', '$window', function($scope, $firebaseArray, $firebaseObject, $rootScope, $window) {

    var messagesRef = new Firebase('https://snipego.firebaseio.com/messages');

    var jackpotRef = new Firebase('https://snipego.firebaseio.com/currentJackpot');

    $scope.visible = true;

    $scope.expandOnNew = true;

    var query = messagesRef.orderByChild("timestamp").limitToLast(10);

    $scope.messages = $firebaseArray(query);

    $scope.jackpotPlayers = {};

    $scope.jackRef = $firebaseObject(jackpotRef);

    $scope.handleJackpotPlayers = function(players) {
      $scope.jackpotPlayers = players.reverse();
    };

    $scope.jackRef.$watch(function(err, data) {
      $scope.jackRef.$loaded().then(function() {
        var players = [];
        for (var key in $scope.jackRef.players) {
          players.push($scope.jackRef.players[key]);
        }
        $scope.handleJackpotPlayers(players);
      });
    });

    $scope.getStyle = function() {
      var transform = 'translateY(-50%) ' + 'translateX(-50%)';
      return {
        'top': '33%',
        'bottom': 'auto',
        'left': '50%',
        'transform': transform,
        '-moz-transform': transform,
        '-webkit-transform': transform,
        'font-size': 65 + 'px',
      };
    };

    $scope.sendMessage = function(message) {
      if (message && message !== '' && $rootScope.user) {
        $scope.messages.$add({
          'username': $rootScope.user.photos[0],
          'content': message
        });
      } else {
        $window.alert('Please sign in to send a message or try again later.');
      }
    };

  }]
);
