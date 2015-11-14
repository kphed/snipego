'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var cookieSession = require('cookie-session');
var jackpot = require('./jackpot');

var expiry = (new Date().getTime()/1000) + 10 * 365 * 24 * 60 * 60;
var Firebase = require('firebase');
var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGenerator = new FirebaseTokenGenerator(process.env.FIREBASE_SECRET);
var tokenGenerator2 = new FirebaseTokenGenerator(process.env.FIREBASE_SECRET2);
var token = tokenGenerator.createToken({uid: "snipego"}, {admin: true, expires: expiry});
var token2 = tokenGenerator2.createToken({uid: "snipego"}, {admin: true, expires: expiry});

var ref = new Firebase('https://snipego.firebaseio.com/');

var sgRef = new Firebase(process.env.FIREBASE_DATABASE);

sgRef.authWithCustomToken(token, function(error, authData) {
  if (error) {
    console.log('error! ', error);
  } else {
    console.log('Authenticated');
  }
});

ref.authWithCustomToken(token2, function(error, authData) {
  if (error) {
    console.log('error! ', error);
  } else {
    console.log('Authenticated');
  }
});

// ref.onAuth(function(authData) {
//   if (authData) {
//     console.log('SnipeGo Successfully authenticated');
//   } else {
//     ref.authWithCustomToken(token, function(error, authData) {
//       if (error) {
//         console.log('error! ', error);
//       } else {
//         console.log('Authenticated');
//       }
//     });
//   }
// });

// sgRef.onAuth(function(authData) {
//   if (authData) {
//     console.log('SnipeGo2 Successfully authenticated');
//   } else {
//     sgRef.authWithCustomToken(token, function(error, authData) {
//       if (error) {
//         console.log('error! ', error);
//       } else {
//         console.log('Authenticated');
//       }
//     });
//   }
// });

require('./passport/passport')(passport);

var app = express();

app.use(cookieSession({
  secret: 'csgo',
  cookie: { maxAge: 86400000 }
}));
app.use(passport.initialize());
app.use(passport.session());

var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');
var deposit = require('./routes/deposit');

app.use(favicon(__dirname + '/client/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/client/public')));
app.use('/bower_components', express.static(__dirname + '/client/bower_components'));

app.use('/', routes);
app.use('/users', users);
app.use('/auth', auth);
app.use('/deposit', deposit);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: err
//     });
//   });
// }

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
