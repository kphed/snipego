var express = require('express');
var router = express.Router();
var passport = require('passport');
var Firebase = require('firebase');

router.get('/steam', passport.authenticate('steam'), function(req, res, next) {
});

router.get('/steam-callback', passport.authenticate('steam'), function(req, res) {
  res.redirect('/#/');
});

router.get('/is-authenticated', function(req, res) {
  var userRef = new Firebase('https://snipego.firebaseio.com/users/' + req.session.passport.user.id);
  userRef.once('value', function(data) {
    var user = data.val();
    if (user) {
      res.json(user);
    } else {
      res.end();
    }
  });
});

module.exports = router;
