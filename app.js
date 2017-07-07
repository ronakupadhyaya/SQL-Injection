"use strict";

var morgan = require('morgan');
var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var models = require('./models');

var csurf = require('csurf');
var session = require('cookie-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

// Secrets default to their name, unless there are process.ENV overrides
function getSecret(key) {
  return process.env[key] || key;
}


app.engine('hbs', exphbs({
  extname: 'hbs',
  defaultLayout: 'main'
}));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('combined'));
app.use(session({
  name: 'session',
  keys: ['hello'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(csurf());

app.get('/', function(req, res) {
  res.render('stage1', {
    stage2: getSecret('stage2'),
    csurfToken: req.csurfToken()
  });
});

app.post('/', function(req, res, next) {
  var password = req.body.password;

  if (password === 'gingerbread') {
    res.redirect('/stage2');
  } else {
    res.redirect('/');
  }
});

app.get('/' + getSecret('stage2'), function(req, res) {
  res.render('stage2', {
    user: req.session.secureCookie,
    admin: req.session.secureCookie === 'admin',
    stage3: getSecret('stage3'),
    csurfToken: req.csurfToken()
  });
});

app.post('/' + getSecret('stage2'), function(req, res) {
  if (req.body.username === 'bob' && req.body.password === 'baseball') {
    req.session.secureCookie = req.body.username;
    res.redirect('/' + getSecret('stage2'));
  } else {
    res.sendStatus(401);
  }
});

app.get('/' + getSecret('stage3'), function(req, res) {
  res.render('stage3', {
    stage3: getSecret('stage3')
  });
});

app.post('/' + getSecret('stage3'), function(req, res) {
  var secret = req.body.secret;
  if (typeof secret === 'string') {
    models.Secret.findOne({
      secret: secret
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
        secret.stage4url = "/" + getSecret('stage4');
        res.json({
          secret: secret
        });
      }
    });
  } else {
    res.status(400);
    res.send('Bad secret format.');
  }
});

app.get('/' + getSecret('stage4'), function(req, res) {
  res.render('stage4', {
    csurfToken: req.csurfToken()
  });
});

app.use('/exercise2', require('./exercise2'));

app.listen(process.env.PORT || 3000);
