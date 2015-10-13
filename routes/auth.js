var express = require('express');
var router = express.Router();
var passport = require('passport');
var Firebase = require('firebase');

var userRef = new Firebase('https://snipego.firebaseio.com/users/' + req.session.passport.user.id);

router.get('/steam', passport.authenticate('steam'), function(req, res, next) {
});

router.get('/steam-callback', passport.authenticate('steam'), function(req, res) {
  res.redirect('/#/');
});

router.get('/is-authenticated', function(req, res) {
  userRef.once('value', function(data) {
    res.json(data.val());
  });
});

module.exports = router;
