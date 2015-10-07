var express = require('express');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var pg = require('pg');
var connectionString = require('../db/config');

router.get('/auth/steam', passport.authenticate('steam'), function(req, res, next) {
});

router.get('/auth/steam-callback', passport.authenticate('steam'), function(req, res) {
  res.redirect('/#/');
});

router.get('/auth/is-authenticated', function(req, res) {
  res.json(req.session.passport.user);
});

router.post('/inventory', function(req, res) {
  console.log('post inventory', req.body);
  pg.connect(connectionString, function(err, client) {
    client.query('SELECT * FROM users WHERE steamid = ' + req.body.steamid, function(err, result) {
      if (result.rows[0].items !== null) {
        res.json(JSON.parse(result.rows[0].items));
      } else {
        var url = 'http://steamcommunity.com/profiles/' + req.body.steamid + '/inventory/json/730/2';

        request({
          url: url,
          json: true
        }, function (error, response, body) {
          if (!error && response.statusCode === 200) {
            var text = JSON.stringify(body);
            client.query('UPDATE users SET items = ($1) WHERE steamid = ($2)', [text, req.body.steamid]);

            var query = client.query('SELECT items FROM users WHERE steamid = ' + req.body.steamid);

            query.on('row', function(row) {
              res.json(JSON.parse(row.items));
            });

            query.on('end', function() {
              client.end();
            });
          }
        });
      }
    });
  });
});

router.post('/update-inventory', function(req, res) {

  pg.connect(connectionString, function(err, client) {
    var url = 'http://steamcommunity.com/profiles/' + req.body.steamid + '/inventory/json/730/2';

    request({
      url: url,
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var text = JSON.stringify(body);
        client.query('UPDATE users SET items = ($1) WHERE steamid = ($2)', [text, req.body.steamid]);

        var query = client.query('SELECT items FROM users WHERE steamid = ' + req.body.steamid);

        query.on('row', function(row) {
          res.json(JSON.parse(row.items));
        });

        query.on('end', function() {
          client.end();
        });
      }
    });
  });
});

module.exports = router;
