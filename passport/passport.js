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
    returnURL: 'http://localhost:3000/auth/steam-callback',
    realm: 'http://localhost:3000/',
    apiKey: '246A470ECF68BF35DA0E3E2B8671F24D'
  }, function(identifier, profile, done) {
      console.log('Steam profile data: ', profile);
      var steam = {
        id: profile.id,
        photos: [profile.photos[0].value, profile.photos[1].value],
      };
      var userRef = new Firebase('https://snipego.firebaseio.com/users');
      userRef.once('value', function(data) {
        var dataValue = data.val();
        if (dataValue && dataValue[steam.id]) {
          console.log('This user exists in firebase!');
          return done(null, dataValue[steam.id]);
        } else {
          console.log('User does not exist, adding to database');
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
