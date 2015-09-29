'use strict';

angular.module('SnipeGo.MainCtrl', ['SnipeGo'])
  .controller('MainCtrl', ['$scope', function($scope) {
    $scope.getStyle = function(){
      var transform = 'translateY(-50%) ' + 'translateX(-50%)';
      console.log('calling getStyle');
      return {
          'top': '50%',
          'bottom': 'auto',
          'left': '50%',
          'transform': transform,
          '-moz-transform': transform,
          '-webkit-transform': transform,
          'font-size': 75 + 'px'
      };
    };
  }]
);
