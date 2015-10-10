var express = require('express');
var router = express.Router();
var passport = require('passport');
var Firebase = require('firebase');
var request = require('request');

router.post('/', function(req, res) {
  var jackpotRef = new Firebase('https://snipego.firebaseio.com/jackpot');
  jackpotRef.once('value', function(data) {
    var jackpotData = data.val();
    if (jackpotData[jackpotData.length - 1].players[req.body.steamid]) {
      console.log('You are already in the jackpot!');
    } else {
      console.log('You are not in the jackpot, but we are checking your items first');
      var url = 'http://steamcommunity.com/profiles/' + req.body.steamid + '/inventory/json/730/2';
      request({
      url: url,
      json: true
      }, function(err, response, body) {
        if (!err && response.statusCode === 200) {
          for (var key in req.body.items) {
            if (!body.rgInventory[key]) {
              console.log('You are missing an item from your inventory!');
              return;
            }
          }
          console.log('You have all your items, sending your items to the bot now...');
        } else {
          console.log('There was an error: ', err);
        }
      });
      //call bot function here to make trade request
    }
  });
});

module.exports = router;
