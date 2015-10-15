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
    if (jackpotData.players) {
      for (var i = 0; i < jackpotData.players.length; i++) {
        if (jackpotData.players[i].id === "" + req.body.id + "") {
          console.log('You are already in the jackpot!');
          res.json({'error': 'User is already in jackpot'});
        }
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
            console.log('Trade posted successfully, here is the body: ', body);
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
