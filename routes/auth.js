var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('steam', passport.authenticate('steam'), function(req, res) {
});

router.get('steam-callback', passport.authenticate('steam'), function(req, res) {
  res.redirect('/#/');
});

router.get('is-authenticated', function(req, res) {
  res.json(req.session.passport.user);
});

module.exports = router;
