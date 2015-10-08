var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var Firebase = require('firebase');

router.get('/auth/steam', passport.authenticate('steam'), function(req, res, next) {
});

router.get('/auth/steam-callback', passport.authenticate('steam'), function(req, res) {
  res.redirect('/#/');
});

router.get('/auth/is-authenticated', function(req, res) {
  res.json(req.session.passport.user);
});

var getMarketPrice = function(market_hash_name) {
  var marketPricesRef = new Firebase('https://flickering-inferno-567.firebaseio.com/market_prices');
  var url = 'http://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=' + encodeURIComponent(market_hash_name);

  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (!body || typeof body === 'string') {
      return null;
    } else {
      if (body.median_price) {
        var formatted = market_hash_name.replace(/[.#$]/g, "");
        marketPricesRef.child(formatted).set({
          market_hash_name: market_hash_name,
          market_price: body.median_price,
        });
        return body.median_price;
      }
    }
  });
};

router.post('/update-inventory', function(req, res) {
    var marketPricesRef = new Firebase('https://flickering-inferno-567.firebaseio.com/market_prices');
    var url = 'http://steamcommunity.com/profiles/' + req.body.steamid + '/inventory/json/730/2';

    marketPricesRef.once('value', function(data) {
      var marketPricesObj = data.val();
      request({
        url: url,
        json: true
      }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          for (var key in body.rgDescriptions) {
            if (!marketPricesObj || !marketPricesObj[body.rgDescriptions[key].market_hash_name] || !marketPricesObj[body.rgDescriptions[key].market_hash_name].market_price) {
              body.rgDescriptions[key].market_price = getMarketPrice(body.rgDescriptions[key].market_hash_name);
            } else {
              body.rgDescriptions[key].market_price = marketPricesObj[body.rgDescriptions[key].market_hash_name].market_price;
            }
          }
          res.json(body);
        }
      });

    });

});

module.exports = router;
