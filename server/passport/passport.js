var SteamStrategy = require('passport-steam').Strategy;
var pg = require('pg');
var connectionString = require('../db/config');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    console.log('serialize user, data: ', user);
    done(null, user);
  });

  passport.deserializeUser(function(id, done) {
    console.log('deserialize user, id: ', id);
    done(null, id);
  });

  var checkDatabase = function(done, profile) {
    console.log('connecting to database now...');
    pg.connect(connectionString, function(err, client) {
      if (err) {
        console.log('there is an error ', err);
      }
      client.query('SELECT EXISTS(SELECT steamid FROM users WHERE steamid = ' + profile.id + ')', function(err, result) {
        if (result.rows[0].exists) {
          console.log('the user exists, no need to remake');
          finish(done, profile);
        } else {
          client.query('INSERT INTO users(steamid, avatar) values ($1, $2)', [profile.id, profile.photos[0].value], function(err, result) {
            console.log('user does not exist, making him');
            finish(done, profile);
          });
        }
      });
    });
  };

  var finish = function(done, profile) {
    console.log('FINISHED');
    return done(null, profile);
  };

  passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3000/users/auth/steam-callback',
    realm: 'http://localhost:3000/',
    apiKey: '49F43DF2D78801407F56520B9195E7F6'
  }, function(identifier, profile, done) {
      return checkDatabase(done, profile);
    })
  );
};
