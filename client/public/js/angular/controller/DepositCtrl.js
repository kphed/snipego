'use strict';

angular.module('SnipeGo.DepositCtrl', ['SnipeGo', 'SnipeGo.Services'])
  .controller('DepositCtrl', ['$scope', '$http', '$rootScope', '$window', function($scope, $http, $rootScope, $window) {

    $scope.inventoryLoading = false;

    $scope.depositingItems = false;

    $scope.items = [];

    $scope.selectedItems = {};


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
      console.log('item is ', item);
      if ($scope.selectedItems[item.assetid]) {
        delete $scope.selectedItems[item.assetid];
      } else {
        if ($rootScope.itemsSelected === 20) {
          $window.alert('You can\'t add more than 20 items');
        } else {
          $scope.selectedItems[item.assetid] = item;
        }
      }
    };

    $scope.depositItems = function() {
      console.log('$root scope', $rootScope.user);
      if ($scope.totalValue() < 5) {
        $window.alert('You need at least 5 value in skins to play');
      } else {
        $scope.depositingItems = true;
        var depositData = {
          displayName: $rootScope.user.displayName,
          avatar: $rootScope.user.photos[1],
          id: $rootScope.user.id,
          items: $scope.selectedItems,
          itemsValue: $scope.totalValue(),
          itemsCount: $rootScope.itemsSelected,
        };
        console.log('depositData is ', depositData);
        $http.post('/deposit/', depositData).success(function(resp) {
          console.log('Posted data to backend... and here is the response ', resp);
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
        $scope.inventoryLoading = false;
        $scope.items.sort(function(a, b) {
          if (a.market_price < b.market_price) {
            return 1;
          } else {
            return -1;
          }
          return 0;
        });
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
      console.log('updating inventory for ', $rootScope.user.id);
      $scope.inventoryLoading = true;
      $http.post('/users/update-inventory', {steamid: $rootScope.user.id})
        .success(function(resp) {
          $scope.fetchItems(resp.rgInventory, resp.rgDescriptions);
      });
    };

  }]
);
