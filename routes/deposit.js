var express = require('express');
var router = express.Router();
var passport = require('passport');
var Firebase = require('firebase');
var request = require('request');

var jackpotRef = new Firebase('https://snipego.firebaseio.com/currentJackpot');

router.post('/', function(req, res) {
  console.log(' the body is ', req.body);
  jackpotRef.once('value', function(data) {
    var jackpotData = data.val();
    var url = 'http://steamcommunity.com/profiles/' + req.body.id + '/inventory/json/730/2';
    console.log('url is ', url);
    request.get({
    url: url,
    json: true
    }, function(err, response, body) {
      console.log('boddyyy ', body);
      if (!err) {
        for (var key in req.body.items) {
          console.log('req.body.items ', req.body.items[key], key, req.body.items, body.rgInventory[key]);
          if (!body.rgInventory[key]) {
            res.json({'error': 'User is missing an item from their inventory'});
            return;
          }
        }
        var items = [];
        for (var item in req.body.items) {
          items.push(req.body.items[item]);
        }
        var botTradeObj = req.body;
        var tradeUrl = req.body.tradeUrl;
        var p = tradeUrl.indexOf('&');
        var accessToken = tradeUrl.substr(p + '&token='.length);
        botTradeObj.items = items;
        botTradeObj.tradeToken = accessToken;
        console.log('botTradeObj ', botTradeObj);
        request.post({
          url: 'https://snipego3.herokuapp.com/user-deposit',
          body: botTradeObj,
          json: true,
        }, function(error, response, body) {
          if (error) {
            console.log(error);
            res.json({'error': error});
          } else {
            console.log('Trade posted successfully');
            res.json({'success': body});
          }
        });
      } else {
        console.log('There was an error: ', err);
        res.json({'error': err});
      }
    });
  });
});

module.exports = router;
