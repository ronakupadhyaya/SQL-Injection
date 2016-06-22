"use strict";

var path = require('path');
var express = require('express');
var exphbs  = require('express-handlebars');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

// Secrets default to their name, unless there are process.ENV overrides
function getSecret(key) {
  return process.env[key] || key;
}

app.engine('hbs', exphbs({extname: 'hbs', defaultLayout: 'main'}));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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
  res.render('stage3');
});

var models = require('./models');

app.get('/donate', function(req, res) {
  models.Donation.find(function(err, donations) {
    res.render('donate', {
      donations: donations
    });
  });
});

app.post('/donate', function(req, res) {
  req.body.amount = parseInt(req.body.amount);
  var d = new Donation(req.body);
  d.save(function(err) {
    if (err) {
      res.status(400).json(err);
    } else {
      res.redirect('/donate');
    }
  });
});

app.get('/login', function(req, res) {
  res.render('login', {
    user: req.cookies.user
  });
});

app.post('/login', function(req, res) {
  if (req.body.username === 'user' && req.body.password === 'pass') {
    res.cookie('user', req.body.username);
    res.redirect('/login');
  } else {
    res.sendStatus(401);
  }
});

app.post('/logout', function(req, res) {
  res.clearCookie('user');
  res.redirect('/login');
});

app.listen(3000);
