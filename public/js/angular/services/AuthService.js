'use strict';

angular
  .module('SnipeGo.AuthService', ['SnipeGo'])
  .factory('Authenticate', ['$http', '$scope', function($http, $scope) {
    var checkSession = function() {
      $http.get('/users/auth/is-authenticated')
        .success(function(resp) {
          console.log('is the user authenticated?', resp);
        });
    };

    return {
      checkSession: checkSession
    };
  }]);
