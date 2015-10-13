var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var Firebase = require('firebase');

var pollTimeout = setTimeout(function() {
  pollFirebaseQueue();
}, 10000);

var ref = new Firebase('https://snipego.firebaseio.com/');

var pollFirebaseQueue = function() {
  console.log('Running firebase queue check...');
  ref.child('queue').once('value', function(data) {
    var queueData = data.val();
    if (queueData) {
      console.log('Here is the queue data: ', queueData);
      ref.child('currentJackpot').once('value', function(data) {
        var jackpotData = data.val();
        console.log('Jackpot data is ', jackpotData);
        var firstQueueItem = queueData.shift();
        console.log('firstQueueItem item: ', firstQueueItem, ' original Queue', queueData);
        jackpotData.itemsCount += firstQueueItem.itemsCount;
        console.log('jackpotData itemsCount: ', jackpotData.itemsCount);
        jackpotData.jackpotValue += firstQueueItem.itemsValue;
        console.log('jackpotData jackpotValue: ', jackpotData.jackpotValue);
        if (jackpotData.players) {
          jackpotData.players.push(firstQueueItem);
          console.log('jackpotData players: ', jackpotData.players);
        } else {
          jackpotData.players = [firstQueueItem];
          console.log('jackpotData players: ', jackpotData.players);
        }
        //add queue item to jackpot, remove item from queue, set timeout
        ref.child('queue').set(queueData, function() {
          console.log('Queue callback', jackpotData);
          ref.child('currentJackpot').update({
            itemsCount: jackpotData.itemsCount,
            jackpotValue: jackpotData.jackpotValue,
            players: jackpotData.players,
          }, function() {
            if (jackpotData.itemsCount < 50) {
              console.log('Resetting polling interval');
              pollTimeout = setTimeout(function() {
                pollFirebaseQueue();
              }, 5000);
            } else {
              //end current jackpot game, display salt & %
              //add winner to last jackpot & figure item to keep & send out trade
              //set-up new jackpot
              ref.child('currentJackpot').update({
                itemsCount: 0,
                jackpotValue: 0,
                roundHash: '',
              });
            }
          });
        });
      });
    } else {
      console.log('Nothing found in queue, resetting poll');
      pollTimeout = setTimeout(function() {
        pollFirebaseQueue();
      }, 15000);
      return;
    }
  });
};

module.exports = router;
