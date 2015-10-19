var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var Firebase = require('firebase');
var seedrandom = require('seedrandom');
var bcrypt = require('bcrypt');
var request = require('request');
var rng = seedrandom();
var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGenerator = new FirebaseTokenGenerator(process.env.FIREBASE_SECRET);
var token = tokenGenerator.createToken({uid: "snipego"}, {admin: true});

var hash;
var salt;
var rngStr;

var ref = new Firebase('https://snipego.firebaseio.com/');

var sgRef = new Firebase(process.env.FIREBASE_DATABASE);

sgRef.authWithCustomToken(token, function(error, authData) {
  if (error) {
    console.log('error! ', error);
  } else {
    console.log('Authenticated');
  }
});

var pollTimeout = setTimeout(function() {
    pollFirebaseQueue();
}, 15000);

var jackpotCheck = function() {
  var jackpotRef = ref.child('currentJackpot');
  jackpotRef.once('value', function(data) {
    if (!data.val()) {
      bcrypt.genSalt(10, function(err, data) {
        salt = data;
        rngStr = JSON.stringify(rng());
        bcrypt.hash(rngStr, salt, function(err, data) {
          hash = data;
          ref.child('currentJackpot').set({
            itemsCount: 0,
            jackpotValue: 0,
            roundHash: hash,
          }, function() {
            var formatted = hash.replace(/[.#$]/g, "");
            var sgJackpotRef = sgRef.child(formatted);
            sgJackpotRef.set({
              salt: salt,
              rngStr: rngStr,
            });
          });
        });
      });
    } else {
      hash = data.val().roundHash;
      var formatted = data.val().roundHash.replace(/[.#$]/g, "");
      var sgJackpotRef = sgRef.child(formatted);
      sgJackpotRef.once('value', function(data) {
        console.log('data ', data);
        salt = data.val().salt;
        rngStr = data.val().rngStr;
      });
    }
  });
};

//Checks jackpot on server start-up
jackpotCheck();

router.post('/hash-check', function(req, res) {
  var hashData = req.body;
  return bcrypt.compare(hashData.winningNumber, hashData.hash, function(err, res) {
    console.log('Do these two match? ', res);
    return res;
  });
});

var pollFirebaseQueue = function() {
  console.log('Polling queue again...');
  ref.child('queue').once('value', function(data) {
    var queueData = data.val();
    if (queueData) {
      queueJackpot(queueData);
    } else {
      pollTimeout = setTimeout(function() {
        pollFirebaseQueue();
      }, 15000);
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
    ref.child('users').child(firstQueueItem.id).update({
      tradeID: '',
      protectionCode: '',
    });
    ref.child('queue').set(queueData, function() {
      ref.child('currentJackpot').update({
        itemsCount: jackpotData.itemsCount,
        jackpotValue: jackpotData.jackpotValue,
        players: jackpotData.players,
      }, function() {
        if (jackpotData.itemsCount < 1) {
          pollTimeout = setTimeout(function() {
            pollFirebaseQueue();
          }, 10000);
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
    currentJackpot.tickets = currentJackpot.jackpotValue * 100;
    currentJackpot.winningTicket = Math.ceil((parseFloat(rngStr, 2) * currentJackpot.tickets));
    currentJackpot.winner = currentJackpot.players[winnerArray[currentJackpot.winningTicket]];
    currentJackpot.salt = salt;
    currentJackpot.rngStr = rngStr;
    winnerObj.jackpotValue = currentJackpot.jackpotValue;
    winnerObj.winner = currentJackpot.winner;
    currentJackpot.winner.chance = (currentJackpot.jackpotValue / currentJackpot.winner.itemsValue) * 100;
    winnerObj.tradeToken = currentJackpot.winner.tradeToken;
    ref.child('endedJackpots').push(currentJackpot);
    bcrypt.genSalt(10, function(err, data) {
      salt = data;
      rngStr = JSON.stringify(rng());
      bcrypt.hash(rngStr, salt, function(err, data) {
        hash = data;
        ref.child('currentJackpot').set({
          itemsCount: 0,
          jackpotValue: 0,
          roundHash: hash,
        }, function() {
          var formatted = hash.replace(/[.#$]/g, "");
          var sgJackpotRef = sgRef.child(formatted);
          sgJackpotRef.set({
            salt: salt,
            rngStr: rngStr,
          });
          request.post({
            url: 'https://snipego3.herokuapp.com/user-withdraw',
            body: winnerObj,
            json: true,
          }, function(error, response, body) {
            if (error) {
              console.log(error);
              pollTimeout = setTimeout(function() {
                pollFirebaseQueue();
              }, 10000);
            } else {
              console.log('Trade posted successfully, here is the body: ', body);
              pollTimeout = setTimeout(function() {
                pollFirebaseQueue();
              }, 10000);
            }
          });
        });
      });
    });
  });
};

module.exports = router;
