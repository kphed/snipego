var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var Firebase = require('firebase');

router.post('/update-trade-url', function(req, res) {
  var userRef = new Firebase('https://snipego.firebaseio.com/users/' + req.session.passport.user.id);
  userRef.update({tradeUrl: req.body.tradeUrl}, function() {
    res.json(req.body.tradeUrl);
  });
});

router.post('/update-inventory', function(req, res) {
  var marketPricesRef = new Firebase('https://snipego.firebaseio.com/market_prices');
  var url = 'http://steamcommunity.com/profiles/' + req.body.steamid + '/inventory/json/730/2';
  var formatted;
  marketPricesRef.once('value', function(data) {
    var marketPricesObj = data.val();
    request({
      url: url,
      json: true
    }, function (error, response, body) {
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
        res.json(body);
      }
    });
  });
});

var getMarketPrice = function(market_hash_name) {
  console.log('Calling get market prices');
  var marketPricesRef = new Firebase('https://snipego.firebaseio.com/market_prices');
  var url = 'http://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=' + encodeURIComponent(market_hash_name);
  var median_price = '';
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
