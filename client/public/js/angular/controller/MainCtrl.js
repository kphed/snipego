'use strict';

angular.module('SnipeGo.MainCtrl', ['SnipeGo'])
  .controller('MainCtrl', ['$scope', '$firebaseArray', '$firebaseObject', '$rootScope', '$window', '$http', '$sce','$timeout', function($scope, $firebaseArray, $firebaseObject, $rootScope, $window, $http, $sce, $timeout) {

    var currentJackpotRef = new Firebase('https://snipego.firebaseio.com/currentJackpot');

    var endedJackpotRef = new Firebase('https://snipego.firebaseio.com/endedJackpots');

    var messageRef = new Firebase('https://snipego.firebaseio.com/messages');

    $scope.currentJackpot = $firebaseObject(currentJackpotRef);

    $scope.endedJackpots = $firebaseArray(endedJackpotRef);

    $scope.messages = $firebaseArray(messageRef);

    $scope.ended = [];

    $scope.currentJackpot.$watch(function() {
      $scope.currentJackpot.$loaded().then(function() {
        var players = [];
        for (var key in $scope.currentJackpot.players) {
          $scope.currentJackpot.players[key].chance = (($scope.currentJackpot.players[key].itemsValue / $scope.currentJackpot.jackpotValue) * 100).toFixed(2);
          players.push($scope.currentJackpot.players[key]);
        }
        $scope.currentJackpot.jackpotValue = $scope.currentJackpot.jackpotValue.toFixed(2);
      });
    });

    $scope.endedJackpots.$watch(function() {
      $scope.endedJackpots.$loaded().then(function() {
        $scope.ended = $scope.endedJackpots.slice(-3).reverse();
        for (var i = 0; i < $scope.ended.length; i++) {
          $scope.ended[i].winningNumber = (parseFloat($scope.ended[i].rngStr) * 100).toFixed(2) + '%';
          for (var j = 0; j < $scope.ended[i].players.length; j++) {
            $scope.ended[i].players[j].chance = (($scope.ended[i].players[j].itemsValue / $scope.ended[i].jackpotValue) * 100).toFixed(2);
          }
        }
      });
    });

    $scope.getSteam = function() {
      console.log('Calling get steam');
      $http.get('/users/get-steam').success(function(data) {
        console.log('here is the steam data', data);
      });
    };

    $scope.getStyle = function() {
      var transform = 'translateY(-50%) ' + 'translateX(-50%)';
      return {
        'top': '33%',
        'bottom': 'auto',
        'left': '50%',
        'transform': transform,
        '-moz-transform': transform,
        '-webkit-transform': transform,
        'font-size': 100 + 'px',
      };
    };

    $scope.sendMessage = function(message, username) {
      console.log('Calling send message', message, username, $rootScope.user);
      if (!message) {
        $window.alert('Enter in a message to chat!');
      } else if (!$rootScope.user.id) {
        $window.alert('Sign in to chat!');
      } else {
        var msg = {};
        msg.message = message;
        msg.username = username;
        if ($rootScope.user.staff) {
          msg.staff = $rootScope.user.staff;
        }
        msg.imageUrl = $rootScope.user.photos[0];
        $http.post('/users/send-message', msg).success(function() {
          console.log('Posted message successfully');
        });
      }
    };

  }]
);
