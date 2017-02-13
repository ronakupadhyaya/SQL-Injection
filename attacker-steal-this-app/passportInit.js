"use strict";

module.exports = function(router) {
  var models = require('./models');
  var passport = require('passport');
  var session = require('express-session');
  var LocalStrategy = require('passport-local').Strategy;
  var MongoStore = require('connect-mongo')(session);

  router.use(session({
    cookie: {
      httpOnly: false
    },
    secret: process.env.SECRET || 'deep secret',
    store: new MongoStore({ mongooseConnection: require('mongoose').connection})
  }));

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    models.User.findById(id, function(err, user) {
      done(err, user);
    });
  });

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

  router.use(passport.initialize());
  router.use(passport.session());

  return passport;
}
