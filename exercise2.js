"use strict";

var router = require('express').Router();
var models = require('./models');
var passport = require('./passportInit')(router);

// Secrets default to their name, unless there are process.ENV overrides
function getSecret(key) {
  return process.env[key] || key;
}

router.get('/', function(req, res) {
  res.render('stage5', {
    error: req.query.error,
    msg: req.query.msg
  });
});

router.post('/', passport.authenticate('local', {
  failureRedirect: '/exercise2?error=' + encodeURIComponent('Login failed. Bad username or password.'),
  successRedirect: '/exercise2/' + getSecret('stage6')
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

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/exercise2');
});

router.use(function(req, res, next){
  if (req.user) {
    next();
  } else {
    res.redirect('/exercise2?error=' +
        encodeURIComponent('You must be logged in to access this page.'))
  }
});

router.get('/' + getSecret('stage6'), function(req, res) {
  res.render('stage6', {
    user: req.user
  });
});
// insecure change password
// do not verify that :id === req.user._id

// XSS

// CSRF

module.exports = router;
