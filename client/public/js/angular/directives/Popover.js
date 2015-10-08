'use strict';

angular.module('SnipeGo.Directives', ['SnipeGo'])
  .directive('popover', function() {
    return function(scope, elem) {
    elem.popover();
  };
});
