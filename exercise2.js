"use strict";

var router = require('express').Router;
var passport = require('passport');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;

var MongoStore = require('connect-mongo')(session);
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
});

router.post('/' + getSecret('stage3'), passport.authenticate('local', {
  failureRedirect: '/' + getSecret('stage4'),
  successRedirect: '/home'
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

module.exports = router;
