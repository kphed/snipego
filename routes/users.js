var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/auth/steam', passport.authenticate('steam'), function(req, res, next) {
  //nothing called here, all authentication handled in passport
});

router.get('/auth/steam-callback', passport.authenticate('steam'), function(req, res) {
  console.log('steam auth callback... what is the req session?', req.session);
  res.redirect('/#/');
});

router.get('/auth/is-authenticated', function(req, res) {
  console.log('passing back is authenticated data');
  res.json(req.session.passport.user);
});

module.exports = router;
