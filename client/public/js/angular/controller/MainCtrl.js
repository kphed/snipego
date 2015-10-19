'use strict';

angular.module('SnipeGo.MainCtrl', ['SnipeGo'])
  .controller('MainCtrl', ['$scope', '$firebaseArray', '$firebaseObject', '$rootScope', '$window', function($scope, $firebaseArray, $firebaseObject, $rootScope, $window) {

    var messagesRef = new Firebase('https://snipego.firebaseio.com/messages');

    var currentJackpotRef = new Firebase('https://snipego.firebaseio.com/currentJackpot');

    var endedJackpotRef = new Firebase('https://snipego.firebaseio.com/endedJackpots');

    var messagesQuery = messagesRef.orderByChild("timestamp").limitToLast(10);

    $scope.visible = true;

    $scope.expandOnNew = true;

    $scope.messages = $firebaseArray(messagesQuery);

    $scope.currentJackpot = $firebaseObject(currentJackpotRef);

    $scope.endedJackpots = $firebaseArray(endedJackpotRef);

    $scope.jackpotPlayers = [];

    $scope.ended = [];

    $scope.currentJackpot.$watch(function() {
      $scope.currentJackpot.$loaded().then(function() {
        var players = [];
        for (var key in $scope.currentJackpot.players) {
          $scope.currentJackpot.players[key].chance = ($scope.currentJackpot.players[key].itemsValue / $scope.currentJackpot.jackpotValue) * 100;
          players.push($scope.currentJackpot.players[key]);
        }
        $scope.handleJackpotPlayers(players);
      });
    });

    $scope.endedJackpots.$watch(function() {
      $scope.endedJackpots.$loaded().then(function() {
        $scope.ended = $scope.endedJackpots.slice(-3).reverse();
        for (var i = 0; i < $scope.ended.length; i++) {
          for (var j = 0; j < $scope.ended[i].players.length; j++) {
            $scope.ended[i].players[j].chance = ($scope.ended[i].players[j].itemsValue / $scope.ended[i].jackpotValue) * 100;
          }
          $scope.ended[i].players = $scope.ended[i].players.reverse();
        }
      });
    });

    $scope.calculateChance = function(itemsValue, jackpotValue) {
      return itemsValue / jackpotValue;
    };

    $scope.handleJackpotPlayers = function(players) {
      $scope.jackpotPlayers = players.reverse();
    };

    $scope.getStyle = function() {
      var transform = 'translateY(-50%) ' + 'translateX(-50%)';
      return {
        'top': '35%',
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
