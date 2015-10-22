'use strict';

angular.module('SnipeGo.MainCtrl', ['SnipeGo'])
  .controller('MainCtrl', ['$scope', '$firebaseArray', '$firebaseObject', '$rootScope', '$window', '$http', '$sce','$timeout', function($scope, $firebaseArray, $firebaseObject, $rootScope, $window, $http, $sce, $timeout) {

    var currentJackpotRef = new Firebase('https://snipego.firebaseio.com/currentJackpot');

    var endedJackpotRef = new Firebase('https://snipego.firebaseio.com/endedJackpots');

    $scope.currentJackpot = $firebaseObject(currentJackpotRef);

    $scope.endedJackpots = $firebaseArray(endedJackpotRef);

    $scope.ended = [];

    $scope.twitchPlayer = '<object bgcolor="#000000"' +
        'data="//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf"' +
        'height="250px"' +
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
                'value="channel=joshog&auto_play=true&start_volume=50" />' +
      '</object>' +
      '<iframe frameborder="0" scrolling="no" id="chat_embed" src="http://www.twitch.tv/joshog/chat" height="325" width="100%">' +
      '</iframe>';

    $scope.getTwitch = function() {
      $http.jsonp('https://api.twitch.tv/kraken/streams?game=Counter-Strike%3A%20Global%20Offensive&limit=1?callback=JSON_CALLBACK').success(function(resp) {
        var channelName = resp.streams[0].channel.display_name;
        channelName = channelName.replace(/['"]+/g, '');
        console.log('Channel Name is ', channelName);
        $timeout(function() {
          $scope.twitchPlayer = '<object bgcolor="#000000"' +
            'data="//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf"' +
            'height="250px"' +
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
                    'value="channel=' + channelName + '&auto_play=true&start_volume=50" />' +
          '</object>' +
          '<iframe frameborder="0" scrolling="no" id="chat_embed" src="http://www.twitch.tv/' + channelName.toLowerCase() + '/chat" height="325" width="100%">' +
          '</iframe>';
        });
      });
    };

    $scope.getTwitch();

    $scope.getHtml = function(html) {
      return $sce.trustAsHtml(html);
    };

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

  }]
);
