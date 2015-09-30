var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log('whaaat');
  res.send('respond with a resource');
});

router.get('/auth/steam', passport.authenticate('steam'), function(req, res, next) {
  console.log('steam authentication...');
});

router.get('/auth/steam-callback', passport.authenticate('steam'), function(req, res) {
  console.log('steam auth callback... what is the req session?', req.session);
  res.send('success');
});

router.get('/auth/is-authenticated', function(req, res) {
  console.log('passing back is authenticated data');
});

module.exports = router;
