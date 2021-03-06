'use strict';

angular.module('SnipeGo.MainCtrl', ['SnipeGo'])
  .controller('MainCtrl', ['$scope', '$firebaseArray', '$firebaseObject', '$rootScope', '$window', '$http', function($scope, $firebaseArray, $firebaseObject, $rootScope, $window, $http) {

    var currentJackpotRef = new Firebase('https://snipego.firebaseio.com/currentJackpot');

    var timerRef = new Firebase('https://snipego.firebaseio.com/timer');

    var endedJackpotRef = new Firebase('https://snipego.firebaseio.com/endedJackpots');

    var messageRef = new Firebase('https://snipego.firebaseio.com/messages');

    var query = messageRef.orderByChild("timestamp").limitToLast(15);

    var ended = endedJackpotRef.orderByChild('timestamp').limitToLast(5);

    $scope.currentJackpot = $firebaseObject(currentJackpotRef);

    $scope.timer = $firebaseObject(timerRef);

    $scope.ended = $firebaseArray(ended);

    $scope.messages = $firebaseArray(query);

    $scope.currentJackpot.$watch(function() {
        var players = [];
        for (var key in $scope.currentJackpot.players) {
          $scope.currentJackpot.players[key].chance = (($scope.currentJackpot.players[key].itemsValue / $scope.currentJackpot.jackpotValue) * 100).toFixed(2);
          players.push($scope.currentJackpot.players[key]);
        }
        $scope.currentJackpot.jackpotValue = $scope.currentJackpot.jackpotValue.toFixed(2);
        $scope.currentJackpot.items = $scope.currentJackpot.items.sort(function(a, b) {
          return parseInt(b.market_price) - parseInt(a.market_price);
        });
    });

    $scope.getSteam = function() {
      $http.get('/users/get-steam').success(function(data) {
        console.log('done');
      });
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
        'font-size': 100 + 'px',
      };
    };

    var spamCheck = function(string, user) {
      for (var i = 0; i < string.length; i++) {
        if (string[i].toLowerCase() === 'c') {
          if (string.slice(i, 5).toLowerCase() === "csgo-" || string.slice(i, 5).toLowerCase() === "csg0-" || string.slice(i, 6).toLowerCase() === "cs go-") {
            return "";
          }
          else if (string.slice(i, 8).toLowerCase() === "csgonova" || string.slice(i, 8).toLowerCase() === "csg0nova" || string.slice(i, 8).toLowerCase() === "csgon0va" || string.slice(i, 8).toLowerCase() === "csg0n0va") {
            return "";
          }
          else if (user === "CSGO-FIGHT.COM") {
            return "";
          }
        }
      }
      return string;
    };

    $scope.sendMessage = function(message, username) {
      if (!message) {
        $window.alert('Enter in a message to chat!');
      } else if (!$rootScope.user.id) {
        $window.alert('Sign in to chat!');
      } else {
        var msg = {};
        msg.content = spamCheck(message, username);
        msg.username = $rootScope.user.displayName;
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
