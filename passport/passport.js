'use strict';

var SteamStrategy = require('passport-steam').Strategy;
var Firebase = require('firebase');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  passport.use(new SteamStrategy({
    returnURL: 'http://www.snipego.com/auth/steam-callback',
    realm: 'http://www.snipego.com',
    apiKey: process.env.API_KEY
  }, function(identifier, profile, done) {
    console.log('profile is ', profile);
      var steam = {
        id: profile.id,
        displayName: profile.displayName,
        photos: [profile.photos[0].value, profile.photos[1].value, profile.photos[2].value],
        tradeUrl: '',
      };
      var userRef = new Firebase('https://snipego.firebaseio.com/users');
      userRef.child(steam.id).once('value', function(data) {
        var dataValue = data.val();
        if (dataValue) {
          return done(null, dataValue);
        } else {
          userRef.child(steam.id).set({
            id: steam.id,
            displayName: steam.displayName,
            photos: steam.photos,
            tradeUrl: '',
          }, function() {
            return done(null, steam);
          });
        }
      });
    })
  );
};
