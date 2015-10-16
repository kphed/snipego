'use strict';

angular.module('SnipeGo.DepositCtrl', ['SnipeGo', 'SnipeGo.Services'])
  .controller('DepositCtrl', ['$scope', '$http', '$rootScope', '$window', '$firebaseObject', function($scope, $http, $rootScope, $window, $firebaseObject) {

    var userRef = new Firebase('https://snipego.firebaseio.com/users');

    $scope.users = $firebaseObject(userRef);

    $scope.inventoryLoading = false;

    $scope.tradePending = false;

    $scope.loadingTrade = false;

    $scope.items = [];

    $scope.selectedItems = {};

    $scope.tradeID = '';

    $scope.protectionCode = '';

    $scope.users.$watch(function() {
      $scope.users.$loaded().then(function() {
        $scope.returnID();
      });
    });

    $scope.returnID = function() {
      if ($scope.users[$rootScope.user.id].tradeID === undefined || $scope.users[$rootScope.user.id].protectionCode === undefined || $scope.users[$rootScope.user.id].tradePending === false) {
        $scope.tradeID = $scope.users[$rootScope.user.id].tradeID;
        $scope.protectionCode = $scope.users[$rootScope.user.id].protectionCode;
      } else {
        $scope.tradePending = true;
        $scope.loadingTrade = false;
        $scope.tradeID = $scope.users[$rootScope.user.id].tradeID;
        $scope.protectionCode = $scope.users[$rootScope.user.id].protectionCode;
      }
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
        $window.alert('You need at least $1 skins value to play, select more skins');
      } else {
        $scope.loadingTrade = true;
        $scope.tradePending = true;
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
        });
      }
    };

    // $scope.fetchItems = function(items, descriptions) {
    //   var tempObj = {};
    //   Object.keys(items).map(function(id) {
    //     var item = items[id];
    //     var description = descriptions[item.classid + '_' + (item.instanceid || '0')];
    //     for (var key in description) {
    //       if (!description.market_price) {
    //         continue;
    //       }
    //       item[key] = description[key];
    //     }
    //     if (item.icon_url) {
    //       item.contextid = 2;
    //       tempObj.assetid = item.id;
    //       tempObj.appid = item.appid;
    //       tempObj.contextid = item.contextid;
    //       tempObj.market_hash_name = item.market_hash_name;
    //       tempObj.icon_url = item.icon_url;
    //       tempObj.market_price = item.market_price.slice(1);
    //       $scope.items.push(tempObj);
    //       tempObj = {};
    //     }
    //     return item;
    //   });
    //   $scope.sortItems();
    // };

    $scope.sortItems = function(resp) {
      console.log('resp for sort ', resp);
      $scope.items = resp.sort(function(a, b) {
        return b.market_price - a.market_price;
      });
      $scope.inventoryLoading = false;
      return;
    };

    $scope.fetchInventory = function() {
      $scope.items = [];
      if ($scope.inventoryLoading) {
        console.log('Inventory is already loading');
      } else {
        $scope.inventoryLoading = true;
        $http.post('/users/update-inventory', {steamid: $rootScope.user.id})
          .success(function(resp) {
            console.log('resp is ', resp);
            $scope.sortItems(resp);
        });
      }
    };

  }]
);
