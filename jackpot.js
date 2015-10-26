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
        if (err) {
          console.log('There was an error getting salt ', err);
          jackpotCheck();
          return;
        } else {
          salt = data;
          rngStr = JSON.stringify(rng());
          bcrypt.hash(rngStr, salt, function(err, data) {
            if (err) {
              console.log('There was an error getting hash ', err);
              jackpotCheck();
              return;
            } else {
              hash = data;
              console.log('JACKPOT DOES NOT EXIST! salt: ', salt, ' hash: ', hash, 'rngStr: ', rngStr);
              ref.child('currentJackpot').set({
                itemsCount: 0,
                jackpotValue: 0,
                roundHash: hash,
              }, function() {
                var formatted = hash.replace(/[.#$/]/g, "");
                var sgJackpotRef = sgRef.child(formatted);
                sgRef.set({}, function() {
                  sgJackpotRef.set({
                    salt: salt,
                    rngStr: rngStr,
                  });
                });
              });
            }
          });
        }
      });
    } else {
      hash = data.val().roundHash;
      var formatted = hash.replace(/[.#$/]/g, "");
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

var timeoutTimer = setTimeout(function() {
    timerCheck();
  }, 1100);

var timerCheck = function() {
  ref.child('currentJackpot').once('value', function(data) {
    var jackpotData = data.val();
    if (!jackpotData.timer || jackpotData.timer > 0) {
      console.log('creating a timer or updating it ');
      if (!jackpotData.timer && jackpotData.players) {
        ref.child('currentJackpot').update({
          timer: 120
        }, function() {
          timeoutTimer = setTimeout(function() {
            timerCheck();
          }, 1000);
        });
      }
      else if (jackpotData.timer && jackpotData.players) {
        jackpotData.timer--;
        ref.child('currentJackpot').update({
          timer: jackpotData.timer
        }, function() {
          timeoutTimer = setTimeout(function() {
            timerCheck();
          }, 1000);
        });
      } else {
        timeoutTimer = setTimeout(function() {
          timerCheck();
        }, 10000);
      }
    } else {
      console.log('Calling endround');
      endRound();
      timeoutTimer = setTimeout(function() {
        timerCheck();
      }, 10000);
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
        if (jackpotData.itemsCount < 30) {
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
    var formatted = currentJackpot.roundHash.replace(/[.#$/]/g, "");
    sgRef.child(formatted).once('value', function(data) {
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
            sgRef.set({}, function() {
              sgJackpotRef.set({
                salt: salt,
                rngStr: rngStr,
              }, function() {
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
                    console.log('Making a withdraw request now to bot');
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
    });
  });
};
