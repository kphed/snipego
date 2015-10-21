var express = require('express');
var router = express.Router();
var passport = require('passport');
var Firebase = require('firebase');
var request = require('request');

var jackpotRef = new Firebase('https://snipego.firebaseio.com/currentJackpot');

router.post('/', function(req, res) {
  if (!req.body.items) {
    res.json({'error': 'User is putting in invalid items'});
  } else {
    jackpotRef.once('value', function(data) {
      var jackpotData = data.val();
      var url = 'http://steamcommunity.com/profiles/' + req.body.id + '/inventory/json/730/2';
      request.get({
      url: url,
      json: true
      }, function(err, response, body) {
        if (!err) {
          for (var key in req.body.items) {
            if (!body.rgInventory[key]) {
              res.json({'error': 'User is missing an item from their inventory'});
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
  }
});

module.exports = router;
