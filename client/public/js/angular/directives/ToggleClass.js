'use strict';

angular.module('SnipeGo.Directives', ['SnipeGo'])
  .directive("toggleClass", function() {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            $(elem).click(function() {
                $(elem).toggleClass("highlightSelected");
                // $(elem).toggleClass("itemContainer");
            });
        }
    };
});
