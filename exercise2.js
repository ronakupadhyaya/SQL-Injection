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

router.get('/', function(req, res) {
  res.render('stage5', {
    error: req.query.error,
    msg: req.query.msg
  });
});

router.post('/', passport.authenticate('local', {
  failureRedirect: '/exercise2?error=' + encodeURIComponent('Login failed. Bad username or password.'),
  successRedirect: '/exercise2'
}));

router.get('/signup', function(req, res) {
  res.render('signup');
});

router.post('/signup', function(req, res) {
  var fields = ['username', 'password', 'passwordRepeat']
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    if (! req.body[field]) {
      res.status(400).render('signup', {
        error: field + ' is required.'
      });
      return;
    }
  }
  if (req.body.password !== req.body.passwordRepeat) {
    res.status(400).render('signup', {
      error: "Passwords don't match."
    });
    return;
  }
  var user = new models.User({
    username: req.body.username,
    password: req.body.password
  });
  user.save(function(error) {
    if (error) {
      if (error.errmsg.indexOf('E11000') > -1) {
        error = 'Username is already taken: ' + req.body.username;
      } else {
        error = error.errmsg;
      }
      res.status(400).render('signup', {
        error: error
      })
    } else {
      res.redirect('/exercise2?msg=' + encodeURIComponent('User created: ' + req.body.username));
    }
  });
});


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
