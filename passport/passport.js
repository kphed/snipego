var SteamStrategy = require('passport-steam').Strategy;
var Firebase = require('firebase');
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
    var ref = new Firebase('https://flickering-inferno-567.firebaseio.com/users');
    // pg.connect(connectionString, function(err, client) {
    //   if (err) {
    //     console.log('error: ', err);
    //   }
    //   client.query('SELECT EXISTS(SELECT steamid FROM users WHERE steamid = ' + profile.id + ')', function(err, result) {
    //     if (result.rows[0].exists) {
    //       console.log('the user exists');
    //       finish(done, profile);
    //     } else {
    //       client.query('INSERT INTO users(steamid, avatar) values ($1, $2)', [profile.id, profile.photos[1].value], function(err, result) {
    //         console.log('user does not exist');
    //         finish(done, profile);
    //       });
    //     }
    //   });
    // });
  };

  // var finish = function(done, profile) {
  //   return done(null, profile);
  // };

  passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3000/users/auth/steam-callback',
    realm: 'http://localhost:3000/',
    apiKey: '49F43DF2D78801407F56520B9195E7F6'
  }, function(identifier, profile, done) {
      var steamid = profile.id;
      var photos = [profile.photos[0].value, profile.photos[1].value];

      var userRef = new Firebase('https://flickering-inferno-567.firebaseio.com/users');
      console.log('profile is ', profile);
      userRef.once('value', function(data) {
        console.log('firebase data is ', data.val());
        if (data.val() && data.val()[profile.id]) {
          console.log('this user exists in firebase!');
          return done(null, data.val()[profile.id]);
        } else {
          console.log('user does not exist, adding to database');
          userRef.child(steamid).set({
              photos: photos,
              tradeUrl: '',
          }, function() {
            return done(null, profile);
          });
        }
      });
    })
  );
};
