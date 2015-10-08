'use strict';

angular.module('SnipeGo.DepositCtrl', ['SnipeGo', 'SnipeGo.Services'])
  .controller('DepositCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {

    $scope.inventoryLoading = false;

    $scope.items = [];

    $scope.totalValue = 0;

    $scope.selectedItems = {};

    $scope.selectedQuantity = function() {
      var itemLength = Object.keys($scope.selectedItems).length;
      return ' ' + itemLength + ' Items';
    };

    $scope.selectItem = function(item) {
      var itemLength = Object.keys($scope.selectedItems).length;
      if ($scope.selectedItems[item.assetid]) {
        delete $scope.selectedItems[item.assetid];
        $scope.totalValue -= parseFloat(item.market_price.slice(1)).toFixed(2);
      } else {
        if (itemLength > 20) {
          console.log('You can\'t add anymore items');
        } else {
          $scope.selectedItems[item.assetid] = item;
          $scope.totalValue += parseFloat(item.market_price.slice(1)).toFixed(2);
        }
      }
    };

    $scope.addItems = function(items, descriptions) {
      console.log('calling add items');
      var tempObj = {};
      var itemCount = 0;
      return Object.keys(items).map(function(id) {
        var item = items[id];
        var description = descriptions[item.classid + '_' + (item.instanceid || '0')];
        for (var key in description) {
          item[key] = description[key];
        }
        if (item.market_hash_name !== 'Operation Bloodhound Challenge Coin') {
          item.contextid = 2;
          tempObj.assetid = item.id;
          tempObj.appid = item.appid;
          tempObj.contextid = item.contextid;
          tempObj.market_hash_name = item.market_hash_name;
          tempObj.icon_url = item.icon_url;
          tempObj.market_price = item.market_price;
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
    };

    $scope.updateInventory = function() {
      console.log('updating inventory', $rootScope.user.id);
      $scope.inventoryLoading = true;
      $http.post('/users/update-inventory', {steamid: $rootScope.user.id})
        .success(function(resp) {
          console.log('inventory: ', resp);
          $scope.addItems(resp.rgInventory, resp.rgDescriptions);
        });
    };
  }]
);
