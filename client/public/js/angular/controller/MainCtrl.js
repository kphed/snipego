'use strict';

angular.module('SnipeGo.MainCtrl', ['SnipeGo'])
  .controller('MainCtrl', ['$scope', '$firebaseArray', '$firebaseObject', '$rootScope', '$window', '$http', function($scope, $firebaseArray, $firebaseObject, $rootScope, $window, $http) {

    var currentJackpotRef = new Firebase('https://snipego.firebaseio.com/currentJackpot');

    var endedJackpotRef = new Firebase('https://snipego.firebaseio.com/endedJackpots');

    var messageRef = new Firebase('https://snipego.firebaseio.com/messages');

    var query = messageRef.orderByChild("timestamp").limitToLast(15);

    var ended = endedJackpotRef.orderByChild('timestamp').limitToLast(5);

    $scope.currentJackpot = $firebaseObject(currentJackpotRef);

    $scope.currentItems = [];

    $scope.ended = $firebaseArray(ended);

    $scope.messages = $firebaseArray(query);

    $scope.currentJackpot.$watch(function() {
      $scope.currentJackpot.$loaded().then(function() {
        $scope.currentItems = [];
        var players = [];
        for (var key in $scope.currentJackpot.players) {
          $scope.currentJackpot.players[key].chance = (($scope.currentJackpot.players[key].itemsValue / $scope.currentJackpot.jackpotValue) * 100).toFixed(2);
          players.push($scope.currentJackpot.players[key]);
          $scope.currentItems = $scope.currentItems.concat($scope.currentJackpot.players[key].items);
        }
        $scope.currentJackpot.jackpotValue = $scope.currentJackpot.jackpotValue.toFixed(2);
        $scope.currentItems = $scope.currentItems.sort(function(a, b) {
          return parseInt(b.market_price) - parseInt(a.market_price);
        });
        console.log('current items in pot ', $scope.currentItems);
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
        if (string[i].toLowercase() === 'c') {
          if (string.slice(i, 5).toLowercase() === "csgo-") {
            return "I am spammer. Report me to Steam. Here is my info: " + JSON.stringify(user);
          }
          else if (string.slice(i, 8).toLowercase() === "csgonova") {
            return "I am spammer. Report me to Steam. Here is my info: " + JSON.stringify(user);
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
        msg.content = spamCheck(message, $rootScope.user);
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
