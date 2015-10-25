'use strict';

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

var sgRef = new Firebase(process.env.FIREBASE_DATABASE);

var pollTimeout = setTimeout(function() {
    pollFirebaseQueue();
}, 15000);

var jackpotCheck = function() {
  console.log('checking jackpot');
  var jackpotRef = ref.child('currentJackpot');
  jackpotRef.once('value', function(data) {
    if (!data.val()) {
      bcrypt.genSalt(10, function(err, data) {
        salt = data;
        rngStr = JSON.stringify(rng());
        bcrypt.hash(rngStr, salt, function(err, data) {
          hash = data;
          console.log('JACKPOT DOES NOT EXIST! salt: ', salt, ' hash: ', hash, 'rngStr: ', rngStr);
          ref.child('currentJackpot').set({
            itemsCount: 0,
            jackpotValue: 0,
            roundHash: hash,
          }, function() {
            var formatted = hash.replace(/[.#$/]/g, "");
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
      var formatted = data.val().roundHash.replace(/[.#$/]/g, "");
      var sgJackpotRef = sgRef.child(formatted);
      sgJackpotRef.once('value', function(data) {
        console.log('JACKPOT EXISTS! salt: ', data.val().salt, ' hash: ', hash, 'rngStr: ', data.val().rngStr);
        salt = data.val().salt;
        rngStr = data.val().rngStr;
      });
    }
  });
};

jackpotCheck();

var pollFirebaseQueue = function() {
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
        if (jackpotData.itemsCount < 40) {
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
    sgRef.child(currentJackpot.roundHash).once('value', function(data) {
      var sgData = data.val();
      salt = sgData.salt;
      rngStr = sgData.rngStr;
      console.log('ROUND ENDED! hash: ', hash, ' salt: ', salt, ' rngStr: ', rngStr);
      currentJackpot.tickets = currentJackpot.jackpotValue * 100;
      currentJackpot.winningTicket = Math.floor((parseFloat(rngStr, 2) * currentJackpot.tickets));
      currentJackpot.winner = currentJackpot.players[winnerArray[currentJackpot.winningTicket]];
      currentJackpot.salt = salt;
      currentJackpot.rngStr = rngStr;
      currentJackpot.winner.chance = ((currentJackpot.winner.itemsValue / currentJackpot.jackpotValue) * 100).toFixed(2);
      winnerObj.jackpotValue = currentJackpot.jackpotValue;
      currentJackpot.jackpotValue = currentJackpot.jackpotValue.toFixed(2);
      winnerObj.winner = currentJackpot.winner;
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
            console.log('NEW ROUND! hash: ', hash, 'salt: ', salt, 'rngStr: ', rngStr);
            var formatted = hash.replace(/[.#$/]/g, "");
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
                pollTimeout = setTimeout(function() {
                  pollFirebaseQueue();
                }, 10000);
              }
            });
          });
        });
      });
    });
  });
};
