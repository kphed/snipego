var SteamStrategy = require('passport-steam').Strategy;

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    console.log('serialize');
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    console.log('deserialize');
    done(null, user.id);
  });



  passport.use(new SteamStrategy({
    returnURL: 'http://localhost:3000/users/auth/steam-callback',
    realm: 'http://localhost:3000/',
    apiKey: '49F43DF2D78801407F56520B9195E7F6'
  }, function(identifier, profile, done) {
      //Authentication logic for matching user from database goes here
      console.log('hi');
    })
  );
};
