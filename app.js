"use strict";

var morgan = require('morgan');
var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');
var models = require('./models');
var cookieSession = require('cookie-session');

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

app.use(cookieSession({
  name: "user",
  keys: ["qwertyuiosdfghjkxcvbnm"]
}))

app.get('/', function(req, res) {
  res.render('stage1', {
    stage2: getSecret('stage2')
  });
});

app.post('/', function(req, res) {
  console.log("TEST", req.body.password);
  if (req.body.password === 'gingerbread') {
    res.redirect('/' + getSecret('stage2'));
  } else {
    res.redirect('/');
  }
})

app.get('/' + getSecret('stage2'), function(req, res) {
  res.render('stage2', {
    user: req.session.secureCookie,
    admin: req.session.secureCookie === 'admin',
    stage3: getSecret('stage3')
  });
});

app.post('/' + getSecret('stage2'), function(req, res) {
  console.log(req.body);
  if (req.body.username === 'bob' && req.body.password === 'baseball') {
    req.session.secureCookie = 'bob';
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
  if (typeof secret === "string") {
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
    res.send("BULLSHIT");
  }
});

app.get('/' + getSecret('stage4'), function(req, res) {
  res.render('stage4');
});

app.use('/exercise2', require('./exercise2'));

app.listen(process.env.PORT || 3000);
