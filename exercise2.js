"use strict";

var Router = require('express').Router;
var passport = require('passport');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var models = require('./models');

// Secrets default to their name, unless there are process.ENV overrides
function getSecret(key) {
  return process.env[key] || key;
}

var MongoStore = require('connect-mongo')(session);
var router = Router();

router.use(session({
    secret: process.env.SECRET || 'deep secret',
    store: new MongoStore({ mongooseConnection: require('mongoose').connection})
}));

passport.use(new LocalStrategy(
  function(username, password, done) {
    models.User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (user.password !== password) { return done(null, false); }
      return done(null, user);
    });
  }
));

router.get('/', function(req, res) {
  res.render('stage5', {
    error: req.query.error
  });
});

router.get('/signup', function(req, res) {
  res.render('signup');
});

router.post('/', passport.authenticate('local', {
  failureRedirect: '/' + getSecret('stage4'),
  successRedirect: '/exercise2?error=' + encodeURIComponent('Login failed. Bad username or password.')
}));


router.use(function(req, res, next){
  if (req.user) {
    next();
  } else {
    res.redirect('/' + getSecret('stage4') + '?fail=true');
  }
});

router.get('/home', function(req, res) {
  req.redirect('/profile')
});
// insecure change password
// do not verify that :id === req.user._id

// XSS

// CSRF

module.exports = router;
