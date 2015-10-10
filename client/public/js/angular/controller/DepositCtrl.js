'use strict';

angular.module('SnipeGo.DepositCtrl', ['SnipeGo', 'SnipeGo.Services'])
  .controller('DepositCtrl', ['$scope', '$http', '$rootScope', '$window', function($scope, $http, $rootScope, $window) {

    $scope.inventoryLoading = false;

    $scope.items = [];

    $scope.selectedItems = {};

    $scope.selectedQuantity = function() {
      $rootScope.itemsSelected = Object.keys($scope.selectedItems).length;
      return ' ' + $rootScope.itemsSelected + ' Skins';
    };

    $scope.totalValue = function(bool, value) {
      var num = 0;
      for (var key in $scope.selectedItems) {
        num += parseFloat($scope.selectedItems[key]['market_price']);
      }
      return Math.round(num * 100) / 100;
    };

    $scope.selectItem = function(item) {
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

    $scope.betItems = function() {
      var betData = {
        steamid: $rootScope.user.id,
        items: $scope.selectedItems,
      };
      console.log('betData is ', betData);
      $http.post('/deposit/', betData).success(function() {
        console.log('successfully posted items to backend');
      });
    };

    $scope.fetchItems = function(items, descriptions) {
      var tempObj = {};
      var itemCount = 0;
      return Object.keys(items).map(function(id) {
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
    };

    $scope.fetchInventory = function() {
      $scope.items = [];
      console.log('updating inventory for ', $rootScope.user.id);
      $scope.inventoryLoading = true;
      $http.post('/users/update-inventory', {steamid: $rootScope.user.id})
        .success(function(resp) {
          console.log('items: ', resp);
          $scope.fetchItems(resp.rgInventory, resp.rgDescriptions);
        });
    };
  }]
);
