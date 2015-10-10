var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var Firebase = require('firebase');

router.get('/auth/steam', passport.authenticate('steam'), function(req, res) {
});

router.get('/auth/steam-callback', passport.authenticate('steam'), function(req, res) {
  res.redirect('/#/');
});

router.get('/auth/is-authenticated', function(req, res) {
  res.json(req.session.passport.user);
});

router.post('/update-trade-url', function(req, res) {
  var userRef = new Firebase('https://snipego.firebaseio.com/users/' + req.session.passport.user.id);
  userRef.update({tradeUrl: req.body.tradeUrl}, function() {
    res.json(req.body.tradeUrl);
  });
});

router.post('/update-inventory', function(req, res) {
  var marketPricesRef = new Firebase('https://snipego.firebaseio.com/market_prices');
  var url = 'http://steamcommunity.com/profiles/' + req.body.steamid + '/inventory/json/730/2';
  var formatted = '';
  marketPricesRef.once('value', function(data) {
    var marketPricesObj = data.val();
    request({
      url: url,
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        for (var key in body.rgDescriptions) {
          formatted = body.rgDescriptions[key].market_hash_name.replace(/[.#$]/g, "");
          console.log('formatted market hash ', formatted);
          if (!marketPricesObj || !marketPricesObj[formatted] || !marketPricesObj[formatted].market_price) {
            body.rgDescriptions[key].market_price = getMarketPrice(formatted);
          } else {
            body.rgDescriptions[key].market_price = marketPricesObj[formatted].market_price;
          }
        }
        res.json(body);
      }
    });
  });
});

var getMarketPrice = function(market_hash_name) {
  var marketPricesRef = new Firebase('https://snipego.firebaseio.com/market_prices');
  var url = 'http://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=' + encodeURIComponent(market_hash_name);

  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (!body || typeof body === 'string') {
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
