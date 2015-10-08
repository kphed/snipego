'use strict';

angular.module('SnipeGo.Directives', ['SnipeGo'])
  .directive("toggleClass", function($rootScope) {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            $(elem).click(function() {
              if ($rootScope.itemsSelected < 20) {
                $(elem).toggleClass("highlightSelected");
              } else {
                $(elem).removeClass("highlightSelected");
              }
            });
        }
    };
});
