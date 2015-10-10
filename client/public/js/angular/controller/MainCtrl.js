'use strict';

angular.module('SnipeGo.MainCtrl', ['SnipeGo'])
  .controller('MainCtrl', ['$scope', '$firebaseArray', '$firebaseObject', '$rootScope', '$window', function($scope, $firebaseArray, $firebaseObject, $rootScope, $window) {

    var messagesRef = new Firebase('https://snipego.firebaseio.com/messages');

    var jackpotRef = new Firebase('https://snipego.firebaseio.com/currentJackpot');

    $scope.messages = $firebaseArray(messagesRef);
    $scope.visible = true;
    $scope.expandOnNew = true;

    $scope.jackpot = [];

    $scope.jackRef = $firebaseObject(jackpotRef);

    $scope.handleJackpotPlayers = function(players) {
      $scope.jackpot = [];
      var count = 0;
      var temp = [];
      for (var key in players) {
        count++;
        temp.push(players[key]);
        if (count % 3) {
          if (count === Object.keys(players).length) {
            $scope.jackpot.push(temp);
          }
        } else {
          $scope.jackpot.push(temp);
          temp = [];
        }
      }
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
        'top': '33%',
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
