'use strict';

angular.module('SnipeGo.DepositCtrl', ['SnipeGo', 'SnipeGo.Services'])
  .controller('DepositCtrl', ['$scope', '$http', '$rootScope', '$window', '$firebaseObject', '$timeout', function($scope, $http, $rootScope, $window, $firebaseObject, $timeout) {

    var userRef;

    $scope.users = {};

    var depositData = function() {
      return {
        tradeUrl: $rootScope.user.tradeUrl,
        displayName: $rootScope.user.displayName,
        avatar: $rootScope.user.photos[1],
        full_avatar: $rootScope.user.photos[2],
        id: $rootScope.user.id,
        items: $scope.selectedItems,
        itemsValue: $scope.totalValue(),
        itemsCount: $rootScope.itemsSelected,
      };
    };

    $scope.inventoryLoading = false;

    $scope.loadingTrade = false;

    $scope.items = [];

    $scope.selectedItems = {};

    $scope.tradeID = '';

    $scope.protectionCode = '';

    $scope.errorDetected = false;

    $scope.setUser = function() {
      userRef = new Firebase('https://snipego.firebaseio.com/users/' + $rootScope.user.id);

      $scope.users = $firebaseObject(userRef);

      $scope.users.$watch(function() {
        $scope.users.$loaded().then(function() {
          if ($scope.users.tradeID === undefined || $scope.users.protectionCode === undefined) {
            return;
          } else {
            $scope.tradeID = $scope.users.tradeID;
            $scope.protectionCode = $scope.users.protectionCode;
          }
        });
      });
    };

    $scope.selectedQuantity = function() {
      $rootScope.itemsSelected = Object.keys($scope.selectedItems).length;
      return ' ' + $rootScope.itemsSelected + ' Skins';
    };

    $scope.totalValue = function() {
      var num = 0;
      for (var key in $scope.selectedItems) {
        num += parseFloat($scope.selectedItems[key].market_price);
      }
      return Math.round(num * 100) / 100;
    };

    $scope.selectItem = function(item) {
      if ($scope.selectedItems[item.assetid]) {
        delete $scope.selectedItems[item.assetid];
      } else {
        if ($rootScope.itemsSelected === 10) {
          $window.alert('You can\'t add more than 10 items');
        } else {
          $scope.selectedItems[item.assetid] = item;
        }
      }
    };

    $scope.depositItems = function() {
      if ($scope.totalValue() < 1) {
        $window.alert('You need at least 1 skins value to play, select more skins');
      } else {
        $scope.setUser();
        if ($rootScope.itemsSelected === 0) {
          $window.alert('Please select at least one skin to deposit');
          return;
        }
        $scope.loadingTrade = true;
        $http.post('/deposit/', depositData()).then(function(resp) {
          if (resp.data.error) {
            $window.alert(resp.data.error);
          }
          $scope.selectedItems = {};
          $scope.items = [];
          $scope.loadingTrade = false;
        }, function(error) {
          $scope.errorDetected = true;
          $scope.loadingTrade = false;
          $scope.selectedItems = {};
          $scope.items = [];
          $timeout(function() {
            $scope.errorDetected = false;
          }, 5000);
        });
      }
    };

    $scope.sortItems = function(resp) {
      $scope.items = resp.sort(function(a, b) {
        return b.market_price - a.market_price;
      });
      $scope.inventoryLoading = false;
      return;
    };

    $scope.fetchInventory = function() {
      $scope.selectedItems = {};
      $scope.items = [];
      if ($scope.inventoryLoading) {
        $window.alert('Your inventory is already loading, please be patient');
      } else {
        $scope.inventoryLoading = true;
        $http.post('/users/update-inventory', {steamid: $rootScope.user.id})
          .success(function(resp) {
            $scope.sortItems(resp);
        });
      }
    };
  }]
);
