var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var Firebase = require('firebase');

router.post('/bet', function(req, res, next) {
  var jackpotRef = new Firebase('https://flickering-inferno-567.firebaseio.com/jackpot_test');
  var betData = {};
  var jackpotArray = [];

  betData[req.body.user.id] = {
    value: req.body.items.value,
    items: req.body.items.selected,
  };

  console.log(betData);
  jackpotArray.push(betData);

  jackpotRef.set(jackpotArray, function() {
    console.log('DONE SETTING ITEM ON FIREBASE');
    res.end();
  });
});

module.exports = router;
