var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/auth/steam', passport.authenticate('steam'), function(req, res, next) {
  console.log('steam authentication...');
});

router.get('/auth/steam-callback', passport.authenticate('steam'), function(req, res) {
  console.log('steam auth callback...');
  res.send('success');
});

module.exports = router;
