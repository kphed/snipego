var express = require('express');
var router = express.Router();
var passport = require('passport');
var http = require('http');
var request = require('request');

router.get('/auth/steam', passport.authenticate('steam'), function(req, res, next) {

});

router.get('/auth/steam-callback', passport.authenticate('steam'), function(req, res) {
  console.log('steam auth callback... what is the req session?', req.session);
  res.redirect('/#/');
});

router.get('/auth/is-authenticated', function(req, res) {
  console.log('passing back is authenticated data');
  res.json(req.session.passport.user);
});

router.get('/inventory', function(req, res) {

  var url = "http://steamcommunity.com/id/supremeKP/inventory/json/730/2";

    request({
        url: url,
        json: true
    }, function (error, response, body) {

    if (!error && response.statusCode === 200) {
        res.json(body); // Print the json response
    }
  });
});

module.exports = router;
