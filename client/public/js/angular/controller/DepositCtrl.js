'use strict';

angular.module('SnipeGo.DepositCtrl', ['SnipeGo', 'SnipeGo.Services'])
  .controller('DepositCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {

    $scope.inventoryLoading = false;

    $scope.items = [];

    $scope.selectedItems = {};

    $scope.selectedQuantity = function() {
      var itemLength = Object.keys($scope.selectedItems).length;
      return ' ' + itemLength + ' Items';
    };

    $scope.selectItem = function(item) {
      var itemLength = Object.keys($scope.selectedItems).length;
      if ($scope.selectedItems[item.assetid]) {
        delete $scope.selectedItems[item.assetid];
      } else {
        if (itemLength > 20) {
          console.log('You can\'t add anymore items');
        } else {
          $scope.selectedItems[item.assetid] = item;
        }
      }
    };

    $scope.addItems = function(items, descriptions) {
      console.log('calling add items');
      var row = [];
      var tempObj = {};
      var itemCount = 0;
      return Object.keys(items).map(function(id) {
        var item = items[id];
        var description = descriptions[item.classid + '_' + (item.instanceid || '0')];
        for (var key in description) {
          item[key] = description[key];
        }
        item.contextid = 2;
        tempObj.assetid = item.id;
        tempObj.appid = item.appid;
        tempObj.contextid = item.contextid;
        tempObj.market_hash_name = item.market_hash_name;
        tempObj.icon_url = item.icon_url;
        row.push(tempObj);
        tempObj = {};
        itemCount++;
        if (row.length === 4 || itemCount === (Object.keys(items).length - 1)) {
          $scope.items.push(row);
          row = [];
        }
        $scope.inventoryLoading = false;
        return item;
      });
    };

    // $scope.grabInventory = function() {
    //   console.log('grabbing inventory');
    //   $scope.inventoryLoading = true;
    //   $http.post('/users/inventory', {steamid: $rootScope.user.id})
    //     .success(function(resp) {
    //       console.log('inventory: ', resp);
    //       $scope.addItems(resp.rgInventory, resp.rgDescriptions);
    //     });
    // };

    $scope.updateInventory = function() {
      console.log('updating inventory');
      $scope.inventoryLoading = true;
      $http.post('/users/update-inventory', {steamid: $rootScope.user.id})
        .success(function(resp) {
          console.log('inventory: ', resp);
          $scope.addItems(resp.rgInventory, resp.rgDescriptions);
        });
    };
  }]
);
