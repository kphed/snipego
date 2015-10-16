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
var token = tokenGenerator.createToken(
   {uid: "snipego"},
   { expires: 86400 });

var hash;
var salt;
var rngStr;

var ref = new Firebase('https://snipego.firebaseio.com/');

var sgRef = new Firebase('https://sgjackpot.firebaseio.com/');

sgRef.authWithCustomToken(token, function(error, authData) {
  if (error) {
    console.log('error! ', error);
  } else {
    console.log('Auth data: ', authData);
  }
});

var pollTimeout = setTimeout(function() {
    pollFirebaseQueue();
}, 15000);

var jackpotCheck = function() {
  console.log('Checking jackpot data');
  var jackpotRef = ref.child('currentJackpot');
  jackpotRef.once('value', function(data) {
    if (!data.val()) {
      console.log('No jackpot exists, making one...');
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
      console.log('A current jackpot already exists, retrieving info from redundant backup');
      console.log('Process env variables', typeof process.env.FIREBASE_SECRET, typeof process.env.FIREBASE_DATABASE);
      hash = data.val().roundHash;
      var formatted = data.val().roundHash.replace(/[.#$]/g, "");
      var sgJackpotRef = sgRef.child(formatted);
      sgJackpotRef.once('value', function(data) {
        console.log('data ', data);
        salt = data.val().salt;
        rngStr = data.val().rngStr;
        console.log('comparing number and hash', bcrypt.compareSync(rngStr, hash));
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
      tradePending: false,
    });
    ref.child('queue').set(queueData, function() {
      console.log('Jackpot Data is ', jackpotData);
      ref.child('currentJackpot').update({
        itemsCount: jackpotData.itemsCount,
        jackpotValue: jackpotData.jackpotValue,
        players: jackpotData.players,
      }, function() {
        if (jackpotData.itemsCount < 50) {
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
  //Get current jackpot data, with players, data
  ref.child('currentJackpot').once('value', function(data) {
    var currentJackpot = data.val();
    var winnerArray = [];
    var winnerObj = {};
    winnerObj.items = [];
    //Loop through jackpot players, add all items to one array for easy fetching
    //Multiply the player's item value by 100 to get tickets
    //Push to the winner array amount of times the player's value is
    for (var i = 0; i < currentJackpot.players.length; i++) {
      winnerObj.items = winnerObj.items.concat(currentJackpot.players[i].items);
      var playerValue = currentJackpot.players[i].itemsValue * 100;
      for (var j = 0; j < playerValue; j++) {
        winnerArray.push(i);
      }
    }
    //The winner is at the index of the winner array
    currentJackpot.tickets = currentJackpot.jackpotValue * 100;
    currentJackpot.winningTicket = Math.ceil((parseFloat(rngStr, 2) * currentJackpot.tickets));
    currentJackpot.winner = currentJackpot.players[(winnerArray[currentJackpot.winningTicket])];
    currentJackpot.salt = salt;
    currentJackpot.rngStr = rngStr;
    console.log('currentJackpot Winner is ', currentJackpot.winner);
    console.log('currentJackpot players ', currentJackpot.players);
    console.log('winner array', winnerArray);
    //Add winner to winner property and their chance/trade token
    winnerObj.winner = currentJackpot.winner;
    winnerObj.chance = (currentJackpot.jackpotValue / currentJackpot.winner.itemsValue) * 100;
    winnerObj.tradeToken = currentJackpot.winner.tradeToken;
    console.log('winnerObj ', winnerObj);
    //Push the current jackpot to ended jackpots
    ref.child('endedJackpots').push(currentJackpot);
    //Asynchronously fetch new winning data
    bcrypt.genSalt(10, function(err, data) {
      salt = data;
      console.log('new salt is ', salt);
      rngStr = JSON.stringify(rng());
      console.log('new # is ', rngStr);
      bcrypt.hash(rngStr, salt, function(err, data) {
        hash = data;
        console.log('new hash is ', hash);
        ref.child('currentJackpot').update({
          itemsCount: 0,
          jackpotValue: 0,
          roundHash: hash,
        }, function() {
          var formatted = hash.replace(/[.#$]/g, "");
          var sgJackpotRef = sgRef.child(formatted);
          sgJackpotRef.set({
            salt: salt,
            rngStr: rngStr,
          }, function() {
            console.log('salt is ', salt);
            console.log('rngStr is ', rngStr);
            console.log('hash is ', hash);
            console.log('comparing number and hash', bcrypt.compareSync(rngStr, hash));
          });
          request.post({
            url: 'https://snipego3.herokuapp.com/user-withdraw',
            body: winnerObj,
            json: true,
          }, function(error, response, body) {
            if (error) {
              console.log(error);
            } else {
              console.log('Trade posted successfully, here is the body: ', body);
            }
          });
        });
      });
    });
  });
};

module.exports = router;
