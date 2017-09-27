"use strict";

var morgan = require('morgan');
var path = require('path');
var express = require('express');
var exphbs  = require('express-handlebars');
var models = require('./models');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var cookieSession = require('cookie-session');
var csrf = require('csurf')();
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
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
app.use(csrf);
app.get('/', function(req, res) {
  res.render('stage1', {
    stage2: getSecret('stage2')
  });
});

app.post('/', function(req, res){
  if(req.body.password === 'gingerbread'){
    console.log("getSecret", getSecret('stage2'));
    res.redirect('/' + getSecret('stage2'));
  } else{
    res.redirect('/');
  }
});

app.get('/setCookie', function(req, res){
  req.session.secureCookie = ''
})
app.get('/' + getSecret('stage2'), function(req, res) {
  console.log("REQ>", req.csrfToken());
  if(req.session.secureCookie){
    console.log("adsf", req.cookies.user);
    if(req.session.secureCookie === req.cookies.user){
      res.render('stage2', {
        user: req.cookies.user,
        admin: req.cookies.user === 'admin',
        stage3: getSecret('stage3'),
        _csrf: req.csrfToken()
      });
    } else{
      res.send("wrong cookie");
    }
  }
  else{
    res.render('stage2', {
      user: req.cookies.user,
      admin: req.cookies.user === 'admin',
      stage3: getSecret('stage3'),
      _csrf: req.csrfToken()
    });
  }

});

app.post('/' + getSecret('stage2'), function(req, res) {
  if (req.body.username === 'bob' && req.body.password === 'baseball') {
    res.cookie('user', 'bob');
    req.session.secureCookie = req.body.username;
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
  if(typeof secret === "string"){
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
  } else{
    res.send("Please enter a string!");
  }

});

app.get('/' + getSecret('stage4'), function(req, res) {
  res.render('stage4');
});

app.use('/exercise2', require('./exercise2'));

app.listen(process.env.PORT || 3000);
