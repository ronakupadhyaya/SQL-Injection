"use strict";

var path = require('path');
var express = require('express');
var exphbs  = require('express-handlebars');
var passport = require('passport');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;
var models = require('./models');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

// Secrets default to their name, unless there are process.ENV overrides
function getSecret(key) {
  return process.env[key] || key;
}

var MongoStore = require('connect-mongo')(session);
app.use(session({
    secret: process.env.SECRET || 'deep secret',
    store: new MongoStore({ mongooseConnection: require('mongoose').connection})
}));

app.engine('hbs', exphbs({extname: 'hbs', defaultLayout: 'main'}));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

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

app.get('/', function(req, res) {
  res.render('stage1', {
    stage2: getSecret('stage2')
  });
});

app.get('/' + getSecret('stage2'), function(req, res) {
  res.render('stage2', {
    user: req.cookies.user,
    admin: req.cookies.user === 'admin',
    stage3: getSecret('stage3')
  });
});

app.post('/' + getSecret('stage2'), function(req, res) {
  console.log(req.body);
  if (req.body.username === 'bob' && req.body.password === 'baseball') {
    res.cookie('user', 'bob');
    res.redirect('/' + getSecret('stage2'));
  } else {
    res.sendStatus(401);
  }
});

app.get('/' + getSecret('stage3'), function(req, res) {
  res.render('stage3',{
    stage3: getSecret('stage3')
  });
});

app.post('/' + getSecret('stage3'), function(req, res) {
  var key = req.body.key;
  Secret.findOne({
    key: key
  }, function(error, secret) {
    if (error) {
      res.status(400).json({
        error: error
      });
    } else if (!secret) {
      res.status(401).json({
        error: "Incorrect key"
      });
    } else {
      res.json({
        secret: secret
      });
    }
  });
});

// app.post('/' + getSecret('stage3'), passport.authenticate('local', {
//   failureRedirect: '/' + getSecret('stage3'),
//   successRedirect: '/home'
// }));

app.get('/home', function(req, res) {
});

// insecure change password

// XSS

// CSRF

// Insecure JSON login

app.listen(3000);
