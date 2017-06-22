"use strict";

var morgan = require('morgan');
var path = require('path');
var express = require('express');
var exphbs  = require('express-handlebars');
var models = require('./models');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var app = express();


// Secrets default to their name, unless there are process.ENV overrides
function getSecret(key) {
  return process.env[key] || key;
}


app.engine('hbs', exphbs({extname: 'hbs', defaultLayout: 'main'}));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('combined'));

app.get('/', function(req, res) {
  res.render('stage1', {
    stage2: getSecret('stage2')
  });
});

app.use(cookieSession({
  name: 'session',
  keys: ["secret key here"]
}));

app.get('/' + getSecret('stage2'), function(req, res) {
    // req.session.visted = 1 + parseInt(req.session.visited || 0)
    res.render('stage2', {
    user: req.session.user,
    admin: req.session.user === 'admin',
    stage3: getSecret('stage3')
  });
});

app.post('/' + getSecret('stage2'), function(req, res) {
  console.log(req.body);
  if (req.body.username === 'bob' && req.body.password === 'baseball') {
    // res.cookie('user', 'bob');
    req.session.user = 'bob'
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
  var secret = req.body.secret;
  if (typeof secret !== "string") {
    res.status(400).json({
      error: "please enter a string"
    })
    return
  }
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
});

app.get('/setCookie', function(req, res){
  req.session.secureCookie = 'cookie value';
  res.send('Done!')
});

app.get('/checkCookie', function(req, res){
  if (req.session.secureCookie === 'cookie value') {
    res.send('Good!');
  } else {
    res.status(400).send('Bad!');
  }
});

app.post('/', function(req, res) {
  if(req.body.password !== "gingerbread") {
    res.redirect('/')
  } else {
    res.redirect('/stage2')
  }
});

app.get('/' + getSecret('stage4'), function(req, res) {
  res.render('stage4');
});

app.use('/exercise2', require('./exercise2'));

app.listen(process.env.PORT || 3000);
