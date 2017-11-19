"use strict";

var morgan = require('morgan');
var path = require('path');
var express = require('express');
var exphbs  = require('express-handlebars');
var models = require('./models');
var session = require('cookie-session');
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
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('combined'));
app.use(session({name: 'session', keys: ['key1']}));
var csrf = require('csurf')();
app.use(csrf);


app.use('/route', function(req, res) {
  res.render('template', {
    _csrf: req.csrfToken()
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

app.get('/', function(req, res) {
  res.render('stage1', {
    stage2: getSecret('stage2')
  });
});

app.post('/',function(req,res){                       //Edited
  if(getSecret(req.body.password)==='gingerbread'){
    res.redirect('/stage2');
  }
  else{
    res.redirect('/');
  }
});

app.get('/' + getSecret('stage2'), function(req, res) {
  res.render('stage2', {
    user: req.session.user,
    admin: req.session.user === 'admin',
    stage3: getSecret('stage3')
  });
});

app.post('/' + getSecret('stage2'), function(req, res) {
  console.log(req.body);
  if (req.body.username === 'bob' && req.body.password === 'baseball') {
    req.session.user='bob';
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
  if(typeof secret !== 'String'){
    res.status(401).json({
      error: "Hack"
    });
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

app.get('/' + getSecret('stage4'), function(req, res) {
  res.render('stage4');
});

app.use('/exercise2', require('./exercise2'));

app.listen(process.env.PORT || 3000);
