'use strict';

angular.module('SnipeGo.Services', ['SnipeGo'])
  .factory('Auth', ['$http', function($http) {
    var checkSession = function() {
      return $http.get('/users/auth/is-authenticated');
    };

    return {
      checkSession: checkSession
    };
  }]);
