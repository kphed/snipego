var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var Firebase = require('firebase');

router.post('/bet', function(req, res, next) {
  console.log('posted data is ', req.body);
});

module.exports = router;
