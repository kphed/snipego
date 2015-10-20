'use strict';

angular.module('SnipeGo.MainCtrl', ['SnipeGo'])
  .controller('MainCtrl', ['$scope', '$firebaseArray', '$firebaseObject', '$rootScope', '$window', '$http', function($scope, $firebaseArray, $firebaseObject, $rootScope, $window, $http) {

    var messagesRef = new Firebase('https://snipego.firebaseio.com/messages');

    var currentJackpotRef = new Firebase('https://snipego.firebaseio.com/currentJackpot');

    var endedJackpotRef = new Firebase('https://snipego.firebaseio.com/endedJackpots');

    var messagesQuery = messagesRef.orderByChild('timestamp').limitToLast(10);

    $scope.visible = true;

    $scope.expandOnNew = true;

    $scope.messages = $firebaseArray(messagesQuery);

    $scope.currentJackpot = $firebaseObject(currentJackpotRef);

    $scope.endedJackpots = $firebaseArray(endedJackpotRef);

    $scope.currentJackpot.$watch(function() {
      $scope.currentJackpot.$loaded().then(function() {
        var players = [];
        for (var key in $scope.currentJackpot.players) {
          $scope.currentJackpot.players[key].chance = (($scope.currentJackpot.players[key].itemsValue / $scope.currentJackpot.jackpotValue) * 100).toFixed(2);
          players.push($scope.currentJackpot.players[key]);
        }
        if ($scope.currentJackpot.players) {
          $scope.currentJackpot.players = $scope.currentJackpot.players.reverse();
        }
        $scope.currentJackpot.jackpotValue = $scope.currentJackpot.jackpotValue.toFixed(2);
      });
    });

    $scope.endedJackpots.$watch(function() {
      $scope.endedJackpots.$loaded().then(function() {
        $scope.endedJackpots = $scope.endedJackpots.slice(-3).reverse();
        for (var i = 0; i < $scope.endedJackpots.length; i++) {
          $scope.endedJackpots[i].winningNumber = (parseFloat($scope.endedJackpots[i].rngStr) * 100).toFixed(2) + '%';
          for (var j = 0; j < $scope.ended[i].players.length; j++) {
            $scope.endedJackpots[i].players[j].chance = (($scope.endedJackpots[i].players[j].itemsValue / $scope.endedJackpots[i].jackpotValue) * 100).toFixed(2);
          }
          console.log('before ', $scope.endedJackpots[i].players);
          console.log('after ', $scope.endedJackpots[i].players.reverse());
        }
      });
    });

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
        $http.post('/users/messages', {username: $rootScope.user.photos[0], content: message});
      } else {
        $window.alert('Please sign in to send a message or try again later.');
      }
    };

  }]
);
