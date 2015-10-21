'use strict';

angular.module('SnipeGo.MainCtrl', ['SnipeGo'])
  .controller('MainCtrl', ['$scope', '$firebaseArray', '$firebaseObject', '$rootScope', '$window', '$http', '$sce', function($scope, $firebaseArray, $firebaseObject, $rootScope, $window, $http, $sce) {

    var messagesRef = new Firebase('https://snipego.firebaseio.com/messages');

    var currentJackpotRef = new Firebase('https://snipego.firebaseio.com/currentJackpot');

    var endedJackpotRef = new Firebase('https://snipego.firebaseio.com/endedJackpots');

    var messagesQuery = messagesRef.orderByChild('timestamp').limitToLast(10);

    $scope.visible = true;

    $scope.expandOnNew = true;

    $scope.messages = $firebaseArray(messagesQuery);

    $scope.currentJackpot = $firebaseObject(currentJackpotRef);

    $scope.endedJackpots = $firebaseArray(endedJackpotRef);

    $scope.ended = [];

    var x = String(/joshog/);
    x = x.substring(1, x.length-1);

    $scope.twitchPlayer =  '<object bgcolor="#000000"' +
          'data="//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf"' +
          'height="200px"' +
          'type="application/x-shockwave-flash"' +
          'width="100%"' +
          '>' +
    '<param name="allowFullScreen"' +
            'value="true" />' +
    '<param name="allowNetworking"' +
            'value="all" />' +
    '<param name="allowScriptAccess"' +
            'value="always" />' +
    '<param name="movie"' +
            'value="//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf" />' +
    '<param name="flashvars"' +
            'value="channel=' + x + '&auto_play=true&start_volume=25" />' +
  '</object>';

    $scope.getHtml = function(html){
      return $sce.trustAsHtml(html);
    };

    $scope.getTwitch = function() {
      $http.get('https://api.twitch.tv/kraken/streams?game=Counter-Strike%3A%20Global%20Offensive&limit=1').success(function(resp) {
        console.log('resp is', resp);
      });
    };

    $scope.getTwitch();

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
