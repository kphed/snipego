'use strict';

angular.module('SnipeGo.MainCtrl', ['SnipeGo'])
  .controller('MainCtrl', ['$scope', '$firebaseArray', '$firebaseObject', '$rootScope', '$window', '$http', function($scope, $firebaseArray, $firebaseObject, $rootScope, $window, $http) {

    var currentJackpotRef = new Firebase('https://snipego.firebaseio.com/currentJackpot');

    var endedJackpotRef = new Firebase('https://snipego.firebaseio.com/endedJackpots');

    var messageRef = new Firebase('https://snipego.firebaseio.com/messages');

    $scope.currentJackpot = $firebaseObject(currentJackpotRef);

    var query = messageRef.orderByChild("timestamp").limitToLast(15);

    var ended = endedJackpotRef.orderByChild('timestamp').limitToLast(5);

    $scope.ended = $firebaseArray(ended);

    $scope.endedJackpots = [];

    $scope.messages = $firebaseArray(query);

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

    $scope.ended.$watch(function() {
      $scope.ended.$loaded().then(function() {
        for (var i = $scope.ended.length - 1; i >= 0; i--) {
          console.log('ended items ', $scope.ended[i]);
          $scope.endedJackpots.push($scope.ended[i]);
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
      if (!message) {
        $window.alert('Enter in a message to chat!');
      } else if (!$rootScope.user.id) {
        $window.alert('Sign in to chat!');
      } else {
        var msg = {};
        msg.content = message;
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
