'use strict';

angular.module('SnipeGo.DepositCtrl', ['SnipeGo', 'SnipeGo.Services'])
  .controller('DepositCtrl', ['$scope', '$http', '$rootScope', '$window', '$firebaseObject', function($scope, $http, $rootScope, $window, $firebase, $firebaseObject) {

    var userRef = new Firebase('https://snipego.firebaseio.com/users' + $rootScope.user.id);

    $scope.inventoryLoading = false;

    $scope.depositingItems = false;

    $scope.items = [];

    $scope.selectedItems = {};

    $scope.user = $firebaseObject(userRef);

    $scope.tradePending = true;

    $scope.tradeID = '';

    $scope.user.$watch(function() {
      $scope.user.$loaded().then(function() {
        if ($scope.user.tradeID) {
          $scope.tradePending = true;
          $scope.tradeID = $scope.user.tradeID;
        }
      });
    });

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
        $window.alert('You need at least $1 skins value to play, select more skins');
      } else {
        $scope.depositingItems = true;
        var depositData = {
          tradeUrl: $rootScope.user.tradeUrl,
          displayName: $rootScope.user.displayName,
          avatar: $rootScope.user.photos[1],
          id: $rootScope.user.id,
          items: $scope.selectedItems,
          itemsValue: $scope.totalValue(),
          itemsCount: $rootScope.itemsSelected,
        };
        $http.post('/deposit/', depositData).success(function(resp) {
          $scope.selectedItems = {};
          $scope.depositingItems = false;
        });
      }
    };

    $scope.fetchItems = function(items, descriptions) {
      var tempObj = {};
      Object.keys(items).map(function(id) {
        var item = items[id];
        var description = descriptions[item.classid + '_' + (item.instanceid || '0')];
        for (var key in description) {
          if (!description.market_price) {
            continue;
          }
          item[key] = description[key];
        }
        if (item.icon_url) {
          item.contextid = 2;
          tempObj.assetid = item.id;
          tempObj.appid = item.appid;
          tempObj.contextid = item.contextid;
          tempObj.market_hash_name = item.market_hash_name;
          tempObj.icon_url = item.icon_url;
          tempObj.market_price = item.market_price.slice(1);
          $scope.items.push(tempObj);
          tempObj = {};
        }
        return item;
      });
      $scope.sortItems();
    };

    $scope.sortItems = function() {
      $scope.items = $scope.items.sort(function(a, b) {
        return b.market_price - a.market_price;
      });
      $scope.inventoryLoading = false;
      return;
    };

    $scope.fetchInventory = function() {
      $scope.items = [];
      $scope.inventoryLoading = true;
      $http.post('/users/update-inventory', {steamid: $rootScope.user.id})
        .success(function(resp) {
          $scope.fetchItems(resp.rgInventory, resp.rgDescriptions);
      });
    };

  }]
);
