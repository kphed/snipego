'use strict';

angular.module('SnipeGo.Directives.Popover', ['SnipeGo'])
  .directive('popover', function() {
    return function(scope, element, attrs) {
      element.find("[rel=popover]").popover({ placement: 'bottom', html: 'true'});
    };
});
