var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var Firebase = require('firebase');
var seedrandom = require('seedrandom');
var bcrypt = require('bcrypt');
var request = require('request');

var rng = seedrandom();
var hash;
var salt;
var rngStr;

var ref = new Firebase('https://snipego.firebaseio.com/');


var pollTimeout = setTimeout(function() {
    pollFirebaseQueue();
}, 10000);

// First and foremost, check to make sure there's a jackpot
// when first starting up server
var jackpotCheck = function() {
  console.log('Checking for jackpot');
  var jackpotRef = ref.child('currentJackpot');
  jackpotRef.once('value', function(data) {
    if (!data.val()) {
      rngStr = JSON.stringify(rng());
      salt = bcrypt.genSaltSync(10);
      hash = bcrypt.hashSync(rngStr, salt);
      jackpotRef.set({
        roundHash: hash,
        itemsCount: 0,
        jackpotValue: 0,
      });
      console.log('salt is ', salt);
      console.log('rngStr is ', rngStr);
      console.log('hash is ', hash);
      console.log('comparing number and hash', bcrypt.compareSync(rngStr, hash));
    } else {
      console.log('A current jackpot already exists!');
    }
  });
};

jackpotCheck();

router.post('/hash-check', function(req, res) {
  var hashData = req.body;
  return bcrypt.compare(hashData.winningNumber, hashData.hash, function(err, res) {
    console.log('Do these two match? ', res);
    return res;
  });
});

var pollFirebaseQueue = function() {
  ref.child('queue').once('value', function(data) {
    var queueData = data.val();
    if (queueData) {
      queueJackpot(queueData);
    } else {
      pollTimeout = setTimeout(function() {
        pollFirebaseQueue();
      }, 15000);
      return;
    }
  });
};

var queueJackpot = function(queueData) {
  ref.child('currentJackpot').once('value', function(data) {
    var jackpotData = data.val();
    var firstQueueItem = queueData.shift();
    jackpotData.itemsCount += firstQueueItem.itemsCount;
    jackpotData.jackpotValue += firstQueueItem.itemsValue;
    if (jackpotData.players) {
      jackpotData.players.push(firstQueueItem);
    } else {
      jackpotData.players = [firstQueueItem];
    }
    ref.child('queue').set(queueData, function() {
      ref.child('currentJackpot').update({
        itemsCount: jackpotData.itemsCount,
        jackpotValue: jackpotData.jackpotValue,
        players: jackpotData.players,
      }, function() {
        if (jackpotData.itemsCount !== 1) {
          pollTimeout = setTimeout(function() {
            pollFirebaseQueue();
          }, 5000);
        } else {
          endRound();
        }
      });
    });
  });
};

var endRound = function() {
  ref.child('currentJackpot').once('value', function(data) {
    var currentJackpot = data.val();
    var winnerArray = [];
    var winnerObj = {};
    winnerObj.items = [];
    for (var i = 0; i < currentJackpot.players.length; i++) {
      winnerObj.items = winnerObj.items.concat(currentJackpot.players[i].items);
      var playerValue = currentJackpot.players[i].itemsValue * 100;
      for (var j = 0; j < playerValue; j++) {
        winnerArray.push(i);
      }
    }
    currentJackpot.winner = currentJackpot.players[(winnerArray[Math.ceil((parseFloat(rngStr, 2) * (currentJackpot.jackpotValue * 100)))])];
    console.log('currentJackpot Winner is ', currentJackpot.players[(winnerArray[Math.ceil((parseFloat(rngStr, 2) * (currentJackpot.jackpotValue * 100)))])]);
    console.log('currentJackpot players ', currentJackpot.players);
    console.log('winner array', winnerArray);
    console.log('winnerObj', winnerObj);
    winnerObj.id = currentJackpot.winner.id;
    var tradeUrl = currentJackpot.winner.tradeUrl;
    var p = tradeUrl.indexOf('&');
    var accessToken = tradeUrl.substr(p + '&token='.length);
    winnerObj.tradeToken = accessToken;
    currentJackpot.salt = salt;
    currentJackpot.winningNumber = rngStr;
    console.log('winnerObj is ', winnerObj);
    ref.child('endedJackpots').push(currentJackpot);
    bcrypt.genSalt(10, function(err, data) {
      salt = data;
      rngStr = JSON.stringify(rng());
      bcrypt.hash(rngStr, salt, function(err, data) {
        hash = data;
        ref.child('currentJackpot').update({
          itemsCount: 0,
          jackpotValue: 0,
          roundHash: hash,
        }, function() {
          request.post({
            url: 'https://snipego3.herokuapp.com/user-withdraw',
            body: winnerObj,
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
        });
      });
    });
  });
};

module.exports = router;
