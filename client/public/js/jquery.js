document.addEventListener('DOMContentLoaded', domloaded , false);
function domloaded(){
  (function() {
    var COLORS, Confetti, NUM_CONFETTI, PI_2, canvas, confetti, context, drawCircle, i, range, resizeWindow, xpos;

    NUM_CONFETTI = 350;

    COLORS = [[85, 71, 106], [174, 61, 99], [219, 56, 83], [244, 92, 68], [248, 182, 70]];

    PI_2 = 2 * Math.PI;

    canvas = document.getElementById("world");

    context = canvas.getContext("2d");

    window.w = 0;

    window.h = 0;

    resizeWindow = function() {
      window.w = canvas.width = window.innerWidth;
      return window.h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeWindow, false);

    window.onload = function() {
      return setTimeout(resizeWindow, 0);
    };

    range = function(a, b) {
      return (b - a) * Math.random() + a;
    };

    drawCircle = function(x, y, r, style) {
      context.beginPath();
      context.arc(x, y, r, 0, PI_2, false);
      context.fillStyle = style;
      return context.fill();
    };

    xpos = 0.5;

    document.onmousemove = function(e) {
      return xpos = e.pageX / w;
    };

    window.requestAnimationFrame = (function() {
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
        return window.setTimeout(callback, 1000 / 60);
      };
    })();

    Confetti = (function() {
      function Confetti() {
        this.style = COLORS[~~range(0, 5)];
        this.rgb = "rgba(" + this.style[0] + "," + this.style[1] + "," + this.style[2];
        this.r = ~~range(2, 6);
        this.r2 = 2 * this.r;
        this.replace();
      }

      Confetti.prototype.replace = function() {
        this.opacity = 0;
        this.dop = 0.03 * range(1, 4);
        this.x = range(-this.r2, w - this.r2);
        this.y = range(-20, h - this.r2);
        this.xmax = w - this.r;
        this.ymax = h - this.r;
        this.vx = range(0, 2) + 8 * xpos - 5;
        return this.vy = 0.7 * this.r + range(-1, 1);
      };

      Confetti.prototype.draw = function() {
        var ref;
        this.x += this.vx;
        this.y += this.vy;
        this.opacity += this.dop;
        if (this.opacity > 1) {
          this.opacity = 1;
          this.dop *= -1;
        }
        if (this.opacity < 0 || this.y > this.ymax) {
          this.replace();
        }
        if (!((0 < (ref = this.x) && ref < this.xmax))) {
          this.x = (this.x + this.xmax) % this.xmax;
        }
        return drawCircle(~~this.x, ~~this.y, this.r, this.rgb + "," + this.opacity + ")");
      };

      return Confetti;

    })();

    confetti = (function() {
      var j, ref, results;
      results = [];
      for (i = j = 1, ref = NUM_CONFETTI; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        results.push(new Confetti);
      }
      return results;
    })();

    window.step = function() {
      var c, j, len, results;
      requestAnimationFrame(step);
      context.clearRect(0, 0, w, h);
      results = [];
      for (j = 0, len = confetti.length; j < len; j++) {
        c = confetti[j];
        results.push(c.draw());
      }
      return results;
    };

    step();

  }).call(this);
}

$(document).ready(function() {
  $('.nav-popover').on('mouseenter', function(e) {
    $(this).popover('show');
  });

  $('.nav-popover').on('mouseleave', function(e) {
    $(this).popover('hide');
  });

  $('.btn-popover').on('mouseenter', function(e) {
    $(this).popover('show');
  });

  $('.btn-popover').on('mouseleave', function(e) {
    $(this).popover('hide');
  });
});

document.addEventListener('DOMContentLoaded', domloaded , false);
function domloaded(){
  (function() {
    var COLORS, Confetti, NUM_CONFETTI, PI_2, canvas, confetti, context, drawCircle, i, range, resizeWindow, xpos;

    NUM_CONFETTI = 350;

    COLORS = [[85, 71, 106], [174, 61, 99], [219, 56, 83], [244, 92, 68], [248, 182, 70]];

    PI_2 = 2 * Math.PI;

    canvas = document.getElementById("world");

    context = canvas.getContext("2d");

    window.w = 0;

    window.h = 0;

    resizeWindow = function() {
      window.w = canvas.width = window.innerWidth;
      return window.h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeWindow, false);

    window.onload = function() {
      return setTimeout(resizeWindow, 0);
    };

    range = function(a, b) {
      return (b - a) * Math.random() + a;
    };

    drawCircle = function(x, y, r, style) {
      context.beginPath();
      context.arc(x, y, r, 0, PI_2, false);
      context.fillStyle = style;
      return context.fill();
    };

    xpos = 0.5;

    document.onmousemove = function(e) {
      return xpos = e.pageX / w;
    };

    window.requestAnimationFrame = (function() {
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
        return window.setTimeout(callback, 1000 / 60);
      };
    })();

    Confetti = (function() {
      function Confetti() {
        this.style = COLORS[~~range(0, 5)];
        this.rgb = "rgba(" + this.style[0] + "," + this.style[1] + "," + this.style[2];
        this.r = ~~range(2, 6);
        this.r2 = 2 * this.r;
        this.replace();
      }

      Confetti.prototype.replace = function() {
        this.opacity = 0;
        this.dop = 0.03 * range(1, 4);
        this.x = range(-this.r2, w - this.r2);
        this.y = range(-20, h - this.r2);
        this.xmax = w - this.r;
        this.ymax = h - this.r;
        this.vx = range(0, 2) + 8 * xpos - 5;
        return this.vy = 0.7 * this.r + range(-1, 1);
      };

      Confetti.prototype.draw = function() {
        var ref;
        this.x += this.vx;
        this.y += this.vy;
        this.opacity += this.dop;
        if (this.opacity > 1) {
          this.opacity = 1;
          this.dop *= -1;
        }
        if (this.opacity < 0 || this.y > this.ymax) {
          this.replace();
        }
        if (!((0 < (ref = this.x) && ref < this.xmax))) {
          this.x = (this.x + this.xmax) % this.xmax;
        }
        return drawCircle(~~this.x, ~~this.y, this.r, this.rgb + "," + this.opacity + ")");
      };

      return Confetti;

    })();

    confetti = (function() {
      var j, ref, results;
      results = [];
      for (i = j = 1, ref = NUM_CONFETTI; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        results.push(new Confetti);
      }
      return results;
    })();

    window.step = function() {
      var c, j, len, results;
      requestAnimationFrame(step);
      context.clearRect(0, 0, w, h);
      results = [];
      for (j = 0, len = confetti.length; j < len; j++) {
        c = confetti[j];
        results.push(c.draw());
      }
      return results;
    };

    step();

  }).call(this);
}

$(document).ready(function() {
  $('.nav-popover').on('mouseenter', function(e) {
    $(this).popover('show');
  });

  $('.nav-popover').on('mouseleave', function(e) {
    $(this).popover('hide');
  });

  $('.btn-popover').on('mouseenter', function(e) {
    $(this).popover('show');
  });

  $('.btn-popover').on('mouseleave', function(e) {
    $(this).popover('hide');
  });
});

document.addEventListener('DOMContentLoaded', domloaded , false);
function domloaded(){
  (function() {
    var COLORS, Confetti, NUM_CONFETTI, PI_2, canvas, confetti, context, drawCircle, i, range, resizeWindow, xpos;

    NUM_CONFETTI = 350;

    COLORS = [[85, 71, 106], [174, 61, 99], [219, 56, 83], [244, 92, 68], [248, 182, 70]];

    PI_2 = 2 * Math.PI;

    canvas = document.getElementById("world");

    context = canvas.getContext("2d");

    window.w = 0;

    window.h = 0;

    resizeWindow = function() {
      window.w = canvas.width = window.innerWidth;
      return window.h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeWindow, false);

    window.onload = function() {
      return setTimeout(resizeWindow, 0);
    };

    range = function(a, b) {
      return (b - a) * Math.random() + a;
    };

    drawCircle = function(x, y, r, style) {
      context.beginPath();
      context.arc(x, y, r, 0, PI_2, false);
      context.fillStyle = style;
      return context.fill();
    };

    xpos = 0.5;

    document.onmousemove = function(e) {
      return xpos = e.pageX / w;
    };

    window.requestAnimationFrame = (function() {
      return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
        return window.setTimeout(callback, 1000 / 60);
      };
    })();

    Confetti = (function() {
      function Confetti() {
        this.style = COLORS[~~range(0, 5)];
        this.rgb = "rgba(" + this.style[0] + "," + this.style[1] + "," + this.style[2];
        this.r = ~~range(2, 6);
        this.r2 = 2 * this.r;
        this.replace();
      }

      Confetti.prototype.replace = function() {
        this.opacity = 0;
        this.dop = 0.03 * range(1, 4);
        this.x = range(-this.r2, w - this.r2);
        this.y = range(-20, h - this.r2);
        this.xmax = w - this.r;
        this.ymax = h - this.r;
        this.vx = range(0, 2) + 8 * xpos - 5;
        return this.vy = 0.7 * this.r + range(-1, 1);
      };

      Confetti.prototype.draw = function() {
        var ref;
        this.x += this.vx;
        this.y += this.vy;
        this.opacity += this.dop;
        if (this.opacity > 1) {
          this.opacity = 1;
          this.dop *= -1;
        }
        if (this.opacity < 0 || this.y > this.ymax) {
          this.replace();
        }
        if (!((0 < (ref = this.x) && ref < this.xmax))) {
          this.x = (this.x + this.xmax) % this.xmax;
        }
        return drawCircle(~~this.x, ~~this.y, this.r, this.rgb + "," + this.opacity + ")");
      };

      return Confetti;

    })();

    confetti = (function() {
      var j, ref, results;
      results = [];
      for (i = j = 1, ref = NUM_CONFETTI; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
        results.push(new Confetti);
      }
      return results;
    })();

    window.step = function() {
      var c, j, len, results;
      requestAnimationFrame(step);
      context.clearRect(0, 0, w, h);
      results = [];
      for (j = 0, len = confetti.length; j < len; j++) {
        c = confetti[j];
        results.push(c.draw());
      }
      return results;
    };

    step();

  }).call(this);
}

$(document).ready(function() {
  $('.nav-popover').on('mouseenter', function(e) {
    $(this).popover('show');
  });

  $('.nav-popover').on('mouseleave', function(e) {
    $(this).popover('hide');
  });

  $('.btn-popover').on('mouseenter', function(e) {
    $(this).popover('show');
  });

  $('.btn-popover').on('mouseleave', function(e) {
    $(this).popover('hide');
  });
});

'use strict';

angular.module('SnipeGo',
  ['SnipeGo.Directives.Popover',
  'SnipeGo.Directives.ToggleClass',
  'SnipeGo.MainCtrl',
  'SnipeGo.NavCtrl',
  'SnipeGo.DepositCtrl',
  'SnipeGo.Services',
  'ui.router',
  'firebase',
  'angular-svg-round-progress',
  'irontec.simpleChat',
  'ngAnimate'])
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
      .state('main', {
        url: '/',
        views: {
          '': {
          templateUrl: 'js/template/main.html',
          controller: 'MainCtrl',
          },
          'nav': {
            templateUrl: 'js/template/nav.html',
            controller: 'NavCtrl'
          }
        }
      });
  });


'use strict';

angular.module('SnipeGo',
  ['SnipeGo.Directives.Popover',
  'SnipeGo.Directives.ToggleClass',
  'SnipeGo.MainCtrl',
  'SnipeGo.NavCtrl',
  'SnipeGo.DepositCtrl',
  'SnipeGo.Services',
  'ui.router',
  'firebase',
  'angular-svg-round-progress',
  'irontec.simpleChat',
  'ngAnimate'])
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
      .state('main', {
        url: '/',
        views: {
          '': {
          templateUrl: 'js/template/main.html',
          controller: 'MainCtrl',
          },
          'nav': {
            templateUrl: 'js/template/nav.html',
            controller: 'NavCtrl'
          }
        }
      });
  });


'use strict';

angular.module('SnipeGo.DepositCtrl', ['SnipeGo', 'SnipeGo.Services'])
  .controller('DepositCtrl', ['$scope', '$http', '$rootScope', '$window', '$firebaseObject', function($scope, $http, $rootScope, $window, $firebaseObject) {

    var userRef = new Firebase('https://snipego.firebaseio.com/users');

    $scope.users = $firebaseObject(userRef);

    var depositData = function() {
      return {
        tradeUrl: $rootScope.user.tradeUrl,
        displayName: $rootScope.user.displayName,
        avatar: $rootScope.user.photos[1],
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

    $scope.users.$watch(function() {
      $scope.users.$loaded().then(function() {
        $scope.returnID();
      });
    });

    $scope.returnID = function() {
      if ($scope.users[$rootScope.user.id].tradeID === undefined || $scope.users[$rootScope.user.id].protectionCode === undefined) {
        return;
      } else {
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
      // if ($scope.totalValue() < 2) {
      //   $window.alert('You need at least $2 skins value to play, select more skins');
      // } else {
        if ($rootScope.itemsSelected === 0) {
          $window.alert('Please select at least one skin to deposit');
        }
        $scope.loadingTrade = true;
        $http.post('/deposit/', depositData()).success(function(resp) {
          $scope.selectedItems = {};
          $scope.items = [];
        });
      // }
    };

    $scope.sortItems = function(resp) {
      $scope.items = resp.sort(function(a, b) {
        return b.market_price - a.market_price;
      });
      $scope.inventoryLoading = false;
      return;
    };

    $scope.fetchInventory = function() {
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

'use strict';

angular.module('SnipeGo.MainCtrl', ['SnipeGo'])
  .controller('MainCtrl', ['$scope', '$firebaseArray', '$firebaseObject', '$rootScope', '$window', '$http', function($scope, $firebaseArray, $firebaseObject, $rootScope, $window, $http) {

    var messagesRef = new Firebase('https://snipego.firebaseio.com/messages');

    var currentJackpotRef = new Firebase('https://snipego.firebaseio.com/currentJackpot');

    var endedJackpotRef = new Firebase('https://snipego.firebaseio.com/endedJackpots');

    var messagesQuery = messagesRef.orderByChild('timestamp').limitToLast(10);

    $scope.visible = true;

    $scope.expandOnNew = true;

    $scope.messages = $firebaseArray(messagesQuery);

    $scope.currentJackpot = $firebaseObject(currentJackpotRef);

    $scope.endedJackpots = $firebaseArray(endedJackpotRef);

    $scope.ended = [];

    $scope.currentJackpot.$watch(function() {
      $scope.currentJackpot.$loaded().then(function() {
        var players = [];
        for (var key in $scope.currentJackpot.players) {
          $scope.currentJackpot.players[key].chance = (($scope.currentJackpot.players[key].itemsValue / $scope.currentJackpot.jackpotValue) * 100).toFixed(2);
          players.push($scope.currentJackpot.players[key]);
        }
        $scope.currentJackpot.players = $scope.currentJackpot.players.reverse();
        $scope.currentJackpot.jackpotValue = $scope.currentJackpot.jackpotValue.toFixed(2);
      });
    });

    $scope.endedJackpots.$watch(function() {
      $scope.endedJackpots.$loaded().then(function() {
        $scope.ended = $scope.endedJackpots.slice(-3).reverse();
        for (var i = 0; i < $scope.ended.length; i++) {
          for (var j = 0; j < $scope.ended[i].players.length; j++) {
            $scope.ended[i].players[j].chance = (($scope.ended[i].players[j].itemsValue / $scope.ended[i].jackpotValue) * 100).toFixed(2);
          }
          $scope.ended[i].players = $scope.ended[i].players.reverse();
        }
      });
    });

    $scope.getStyle = function() {
      var transform = 'translateY(-50%) ' + 'translateX(-50%)';
      return {
        'top': '35%',
        'bottom': 'auto',
        'left': '50%',
        'transform': transform,
        '-moz-transform': transform,
        '-webkit-transform': transform,
        'font-size': 65 + 'px',
      };
    };

    $scope.sendMessage = function(message) {
      if (message && message !== '' && $rootScope.user) {
        $http.post('/users/messages', {username: $rootScope.user.photos[0], content: message});
      } else {
        $window.alert('Please sign in to send a message or try again later.');
      }
    };

  }]
);

'use strict';

angular.module('SnipeGo.NavCtrl', ['SnipeGo', 'SnipeGo.Services'])
  .controller('NavCtrl', ['$scope', '$rootScope', 'Auth', '$http', function($scope, $rootScope, Auth, $http) {

    $scope.successDanger = 'danger';

    $scope.isAuth = false;

    $scope.tradeUrlSuccess = false;

    $scope.profilePic = '';

    $scope.tradeUrl = 'Add trade URL to unlock jackpot deposits';

    $scope.playDestination = '#tradeurl';

    $scope.updateTradeUrl = function() {
      if (!$scope.tradeUrl.match(/partner/i) || !$scope.tradeUrl.match(/token/i)) {
        $scope.tradeUrl = 'Invalid trade Url, please try again';
      } else {
      $http.post('/users/update-trade-url', {tradeUrl: $scope.tradeUrl})
        .success(function(resp) {
          $scope.successDanger = 'success';
          $scope.playDestination = '#deposit';
          $scope.tradeUrlSuccess = true;
        });
      }
    };

    $scope.clearPlaceholder = function() {
      $scope.tradeUrl = '';
    };

    $scope.checkAuth = function() {
      Auth.checkSession().success(function(resp) {
        if (resp) {
          $scope.profilePic = resp.photos[1];
          $scope.isAuth = true;
          $rootScope.user = resp;
          if (resp.tradeUrl) {
            $scope.successDanger = 'success';
            $scope.playDestination = '#deposit';
          }
        }
      });
    };

    $scope.checkAuth();

  }]
);

'use strict';

angular.module('SnipeGo.Directives.Popover', ['SnipeGo'])
  .directive('popover', function() {
    return function(scope, element, attrs) {
      element.find("[rel=popover]").popover({ placement: 'bottom', html: 'true'});
    };
});

'use strict';

angular.module('SnipeGo.Directives.ToggleClass', ['SnipeGo'])
  .directive("toggleClass", function($rootScope) {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            $(elem).click(function() {
              if ($rootScope.itemsSelected < 10) {
                $(elem).toggleClass("highlightSelected");
              } else {
                $(elem).removeClass("highlightSelected");
              }
            });
        }
    };
});

'use strict';

angular.module('SnipeGo.Services', ['SnipeGo'])
  .factory('Auth', ['$http', function($http) {
    var checkSession = function() {
      return $http.get('/auth/is-authenticated');
    };

    return {
      checkSession: checkSession
    };
  }]);
