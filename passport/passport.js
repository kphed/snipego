var SteamStrategy = require('passport-steam').Strategy;
var Firebase = require('firebase');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    console.log('serialize user, data: ', user);
    done(null, user);
  });

  passport.deserializeUser(function(id, done) {
    console.log('deserialize user, id: ', id);
    done(null, id);
  });

  passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3000/users/auth/steam-callback',
    realm: 'http://localhost:3000/',
    apiKey: '49F43DF2D78801407F56520B9195E7F6'
  }, function(identifier, profile, done) {
      var steam = {
        id: profile.id,
        photos: [profile.photos[0].value, profile.photos[1].value],
      };
      var userRef = new Firebase('https://flickering-inferno-567.firebaseio.com/users');
      userRef.once('value', function(data) {
        if (data.val() && data.val()[steam.id]) {
          console.log('this user exists in firebase!');
          return done(null, steam);
        } else {
          console.log('user does not exist, adding to database');
          userRef.child(steam.id).set({
              id: steam.id,
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
