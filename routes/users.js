var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var pg = require('pg');
var connectionString = require('../db/config');
var Firebase = require('firebase');

router.get('/auth/steam', passport.authenticate('steam'), function(req, res, next) {
});

router.get('/auth/steam-callback', passport.authenticate('steam'), function(req, res) {
  res.redirect('/#/');
});

router.get('/auth/is-authenticated', function(req, res) {
  res.json(req.session.passport.user);
});

router.post('/inventory', function(req, res) {
  console.log('post inventory', req.body);
  pg.connect(connectionString, function(err, client) {
    client.query('SELECT * FROM users WHERE steamid = ' + req.body.steamid, function(err, result) {
      if (result.rows[0].items !== null) {
        res.json(JSON.parse(result.rows[0].items));
      } else {
        var url = 'http://steamcommunity.com/profiles/' + req.body.steamid + '/inventory/json/730/2';

        request({
          url: url,
          json: true
        }, function (error, response, body) {
          if (!error && response.statusCode === 200) {
            var text = JSON.stringify(body);
            client.query('UPDATE users SET items = ($1) WHERE steamid = ($2)', [text, req.body.steamid]);

            var query = client.query('SELECT items FROM users WHERE steamid = ' + req.body.steamid);

            query.on('row', function(row) {
              res.json(JSON.parse(row.items));
            });

            query.on('end', function() {
              client.end();
            });
          }
        });
      }
    });
  });
});

var getMarketPrice = function(market_hash_name) {
  var marketPricesRef = new Firebase('https://flickering-inferno-567.firebaseio.com/market_prices');
  var url = 'http://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=' + encodeURIComponent(market_hash_name);

  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (!body || typeof body === 'string') {
      return '$0.00';
    } else {
      marketPricesRef.child(market_hash_name).set({
        market_hash_name: market_hash_name,
        market_price: body.median_price,
      });
      return body.median_price;
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
            if (body.rgDescriptions[key].market_hash_name === 'Operation Bloodhound Challenge Coin') {
              continue;
            }
            else if (!marketPricesObj || !marketPricesObj[body.rgDescriptions[key].market_hash_name] || !marketPricesObj[body.rgDescriptions[key].market_hash_name].market_price) {
              console.log('price does not exist for this item, let us get it');
              body.rgDescriptions[key].market_price = getMarketPrice(body.rgDescriptions[key].market_hash_name);
            } else {
              console.log('price exists for this item, setting it ', body.rgDescriptions[key].market_hash_name);
              console.log('the item we are looking at is ', marketPricesObj[body.rgDescriptions[key].market_hash_name], body.rgDescriptions[key].market_hash_name);
              body.rgDescriptions[key].market_price = marketPricesObj[body.rgDescriptions[key].market_hash_name].market_price;
            }
          }
          res.json(body);
        }
      });

    });

});

module.exports = router;
