var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');

router.get('/auth/steam', passport.authenticate('steam'), function(req, res, next) {
});

router.get('/auth/steam-callback', passport.authenticate('steam'), function(req, res) {
  res.redirect('/#/');
});

router.get('/auth/is-authenticated', function(req, res) {
  res.json(req.session.passport.user);
});

router.post('/inventory', function(req, res) {

  var url = 'http://steamcommunity.com/profiles/' + req.body.steamid + '/inventory/json/730/2';

  request({
    url: url,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
        res.json(body);
    }
  });
});

module.exports = router;
