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
    returnURL: 'https://snipego2.herokuapp.com/auth/steam-callback',
    realm: 'https://snipego2.herokuapp.com/',
    apiKey: 'E31FAD47183885249D0F8312EC2319B0'
  }, function(identifier, profile, done) {
      var steam = {
        id: profile.id,
        displayName: profile.displayName,
        photos: [profile.photos[0].value, profile.photos[1].value],
        tradeUrl: '',
      };
      var userRef = new Firebase('https://snipego.firebaseio.com/users');
      userRef.child(steam.id).once('value', function(data) {
        var dataValue = data.val();
        if (dataValue) {
          console.log('This user exists in firebase!');
          return done(null, dataValue);
        } else {
          console.log('User does not exist, adding to database');
          userRef.child(steam.id).set({
            id: steam.id,
            displayName: steam.displayName,
            photos: steam.photos,
            tradeUrl: '',g
          }, function() {
            return done(null, steam);
          });
        }
      });
    })
  );
};
