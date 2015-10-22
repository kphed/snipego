var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var Firebase = require('firebase');

var messagesRef = new Firebase('https://snipego.firebaseio.com/messages');
var marketPricesRef = new Firebase('https://snipego.firebaseio.com/market_prices');

router.post('/update-trade-url', function(req, res) {
  var userRef = new Firebase('https://snipego.firebaseio.com/users/' + req.session.passport.user.id);
  userRef.update({tradeUrl: req.body.tradeUrl}, function() {
    res.json(req.body.tradeUrl);
  });
});

router.post('/update-inventory', function(req, res) {
  var url = 'http://steamcommunity.com/profiles/' + req.body.steamid + '/inventory/json/730/2';
  var formatted;
  marketPricesRef.once('value', function(data) {
    var marketPricesObj = data.val();
    request({
      url: url,
      json: true
    }, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        for (var key in body.rgDescriptions) {
          formatted = body.rgDescriptions[key].market_hash_name.replace(/[.#$]/g, "");
          if (!marketPricesObj || !marketPricesObj[formatted]) {
            console.log('No price exists for: ', formatted, ' fetching it');
            body.rgDescriptions[key].market_price = getMarketPrice(formatted);
          } else {
            console.log('Price exists for: ', formatted);
            body.rgDescriptions[key].market_price = marketPricesObj[formatted].market_price;
          }
        }
        res.json(fetchItems(body.rgInventory, body.rgDescriptions));
      }
    });
  });
});

router.get('/get-steam', function(req, res) {
  var options = {
    proxy: process.env.QUOTAGUARDSTATIC_URL,
    url: 'http://api.steamanalyst.com/apiV2.php?key=83411237971697719',
    headers: {
      'User-Agent': 'node.js'
    }
  };
  request(options, function(err, response, body) {
    console.log('body is ', body);
    addPrices(body, res);
  });
});

var addPrices = function(data, res) {
  var body = JSON.parse(data);
  var formatted;
  var market_price;
  for (var i = 0; i < body.results.length; i++) {
    formatted = body.results[i].market_name.replace(/[.#$]/g, "");
    if (body.results[i].avg_price_7_days) {
      market_price = body.results[i].avg_price_7_days;
    }
    else if (body.results[i].avg_price_30_days) {
      market_price = body.results[i].avg_price_30_days;
    } else {
      market_price = body.results[i].suggested_amount_min;
    }
    marketPricesRef.child(formatted).set({
      market_hash_name: formatted,
      market_price: body.results[i].avg_price_7_days,
    });
  }
  res.json(body);
};

var fetchItems = function(items, descriptions) {
  var tempObj = {};
  var itemsArray = [];
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
      itemsArray.push(tempObj);
      tempObj = {};
    }
    return item;
  });
  return itemsArray;
};

var getMarketPrice = function(market_hash_name) {
  console.log('Calling get market prices');
  var url = 'http://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=' + encodeURIComponent(market_hash_name);
  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (!body || typeof body === 'string' || error) {
      marketPricesRef.child(market_hash_name).set({
        market_hash_name: market_hash_name,
        market_price: '',
      });
      return null;
    } else {
      if (body.median_price) {
        marketPricesRef.child(market_hash_name).set({
          market_hash_name: market_hash_name,
          market_price: body.median_price,
        });
        return body.median_price;
      }
    }
  });
};

module.exports = router;
