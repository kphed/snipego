'use strict';

var express = require('express');
var router = express.Router();
var passport = require('passport');
var Firebase = require('firebase');
var request = require('request');

var jackpotRef = new Firebase('https://snipego.firebaseio.com/currentJackpot');

router.post('/', function(req, res) {
  console.log('The body is ', req.body);
  if (!req.body.items) {
    res.json({'error': 'User is putting in invalid items'});
  } else {
    jackpotRef.once('value', function(data) {
      var jackpotData = data.val();
      if (jackpotData.players) {
        for (var i = 0; i < jackpotData.players.length; i++) {
          if (req.body.displayName === jackpotData.players[i].displayName) {
            res.json({'error': 'You are already in the pot, please wait for the next one!'});
            return;
          }
        }
      }
      var url = 'http://steamcommunity.com/profiles/' + req.body.id + '/inventory/json/730/2';
      request.get({
      url: url,
      json: true
      }, function(err, response, body) {
        if (!err) {
          for (var key in req.body.items) {
            if (!body.rgInventory[key]) {
              res.json({'error': 'You are missing an item you are trying to deposit. Please refresh inventory and try again.'});
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
              res.json({'success': body});
            }
          });
        } else {
          res.json({'error': err});
        }
      });
    });
  }
});

module.exports = router;
