'use strict';

angular.module('SnipeGo.Directives.ToggleClass', ['SnipeGo'])
  .directive("toggleClass", function($rootScope) {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            $(elem).click(function() {
              if ($rootScope.itemsSelected < 10) {
                $(elem).toggleClass("highlightSelected");
              } else {
                $(elem).removeClass("highlightSelected");
              }
            });
        }
    };
});
