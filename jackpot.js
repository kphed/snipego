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

var usersRef = new Firebase('https://snipego.firebaseio.com/users');

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

var setTimeoutTimer = function(milli) {
  timeoutTimer = setTimeout(function() {
    timerCheck();
  }, milli);
};

var setPollTimer = function(milli) {
  pollTimeout = setTimeout(function() {
    pollFirebaseQueue();
  }, milli);
};

var timerCheck = function() {
  ref.child('timer').once('value', function(data) {
      var timerData = data.val();
    ref.child('currentJackpot').once('value', function(data) {
      var jackpotData = data.val();
      console.log('Timer data is ', timerData);
      if (!timerData || timerData.timer === undefined || timerData.timer > 0) {
        if (!timerData.timer && jackpotData.players && jackpotData.players.length > 1) {
          ref.child('timer').update({
            timer: 120
          }, function() {
            timeoutTimer = setTimeout(function() {
              timerCheck();
            }, 1000);
          });
        }
        else if (timerData.timer && jackpotData.players) {
          timerData.timer--;
          ref.child('timer').update({
            timer: timerData.timer
          }, function() {
            setTimeoutTimer(1000);
          });
        } else {
          setTimeoutTimer(10000);
        }
      } else {
        endRound();
        setTimeoutTimer(10000);
      }
    });
  });
};

var queueJackpot = function(queueData) {
  ref.child('currentJackpot').once('value', function(data) {
    var jackpotData = data.val();
    var keyDelete;
    var firstQueueItem;
    for (var key in queueData) {
      firstQueueItem = queueData[key];
      keyDelete = key;
      break;
    }
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
    }, function() {
      ref.child('queue').child(keyDelete).remove(function() {
        console.log('Removed key, in callback now');
        ref.child('currentJackpot').update({
          itemsCount: jackpotData.itemsCount,
          jackpotValue: jackpotData.jackpotValue,
          players: jackpotData.players,
        }, function() {
          if (jackpotData.itemsCount < 50) {
            setPollTimer(5000);
          } else {
            endRound();
          }
        });
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
      currentJackpot.players[i].chance = ((currentJackpot.players[i].itemsValue / currentJackpot.jackpotValue) * 100).toFixed(2);
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
      currentJackpot.winningNumber = (parseFloat(rngStr, 2) * 100).toFixed(2) + "%";
      currentJackpot.winnerIndex = winnerArray[currentJackpot.winningTicket];
      currentJackpot.winner = currentJackpot.players[currentJackpot.winnerIndex];
      currentJackpot.salt = salt;
      currentJackpot.rngStr = rngStr;
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
                    setPollTimer(10000);
                  } else {
                    usersRef.child(winnerObj.winner.id).once('value', function(data) {
                      var userData = data.val();
                      if (data.child('won').exists()) {
                        userData.won = (Math.floor(parseFloat(userData.won, 2)) + Math.floor(parseFloat(winnerObj.jackpotValue, 2))).toFixed(2);
                      } else {
                        userData.won = (Math.floor(parseFloat(winnerObj.jackpotValue, 2))).toFixed(2);
                      }
                      usersRef.child(winnerObj.winner.id).update({
                        won: userData.won
                      }, function() {
                        console.log('Added winnings to user data');
                      });
                    });
                    console.log('Making a withdraw request now to bot');
                    setPollTimer(10000);
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
