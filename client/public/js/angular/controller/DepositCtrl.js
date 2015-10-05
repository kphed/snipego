'use strict';

angular.module('SnipeGo.DepositCtrl', ['SnipeGo', 'SnipeGo.Services'])
  .controller('DepositCtrl', ['$scope', '$http', '$rootScope', function($scope, $http, $rootScope) {

    $scope.inventoryLoading = false;

    $scope.items = [];

    $scope.selectedItems = {};

    $scope.selectedQuantity = function() {
      var itemLength = Object.keys($scope.selectedItems).length
      return ' ' + itemLength + ' Items';
    };

    $scope.selectItem = function(item) {
      if ($scope.selectedItems[item.assetid]) {
        console.log('deselected item is ', item);
        delete $scope.selectedItems[item.assetid];
        console.log('deselected items object is ', $scope.selectedItems);
      } else {
        console.log('selected item is ', item);
        $scope.selectedItems[item.assetid] = item;
        console.log('selected items object is ', $scope.selectedItems);
      }
    }

    $scope.addItems = function(items, descriptions) {
      console.log('calling add items');
      var row = [];
      var tempObj = {};
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
        if (row.length === 4) {
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
