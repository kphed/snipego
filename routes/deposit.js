var express = require('express');
var router = express.Router();
var passport = require('passport');
var Firebase = require('firebase');
var request = require('request');

var jackpotRef = new Firebase('https://snipego.firebaseio.com/currentJackpot');

router.post('/', function(req, res) {
  console.log('depositing items', req.body);
  jackpotRef.once('value', function(data) {
    var jackpotData = data.val();
    for (var i = 0; i < jackpotData.players.length; i++) {
      if (jackpotData.players[i][req.body.id]) {
        console.log('You are already in the jackpot!');
        return;
      }
    }
    console.log('You are not in the jackpot, but we are checking your items first');
    var url = 'http://steamcommunity.com/profiles/' + req.body.id + '/inventory/json/730/2';
    request({
    url: url,
    json: true
    }, function(err, response, body) {
      if (!err && response.statusCode === 200) {
        for (var key in req.body.items) {
          if (!body.rgInventory[key]) {
            console.log('You are missing an item from your inventory!');
            res.json({'error': 'User is missing an item from their inventory'});
          }
        }
        console.log('You have all your items, sending your items to the bot now...');
        var items = [];
        for (var item in req.body.items) {
          items.push(req.body.items[item]);
        }
        var botTradeObj = {};
        var tradeUrl = req.session.passport.user.tradeUrl;
        var p = tradeUrl.indexOf('&');
        var accessToken = tradeUrl.substr(p + '&token='.length);
        botTradeObj.id = req.body.id;
        botTradeObj.displayName = req.body.displayName;
        botTradeObj.avatar = req.body.avatar;
        botTradeObj.items = items;
        botTradeObj.trade_token = accessToken;
        botTradeObj.itemsValue = req.body.itemsValue;
        botTradeObj.itemsCount = req.body.itemsCount;
        console.log('botTradeObj ', botTradeObj);
        res.json(botTradeObj);
        // request.post({
        //   url: 'http://localhost:3017/user-deposit',
        //   body: botTradeObj,
        //   json: true,
        // }, function(error, response, body) {
        //   if (error) {
        //     console.log(error);
        //   } else {
        //     console.log('Trade posted successfully, here is the body: ', body);
        //     res.json(body);
        //   }
        // });
      } else {
        console.log('There was an error: ', err);
        res.json({'error': err});
      }
    });
  });
});

module.exports = router;
