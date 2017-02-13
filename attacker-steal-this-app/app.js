"use strict";

var morgan = require('morgan');
var path = require('path');
var express = require('express');
var exphbs  = require('express-handlebars');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

app.engine('hbs', exphbs({extname: 'hbs', defaultLayout: 'main'}));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('combined'));

app.get('/', function(req, res) {
  res.render('index');
});


app.get('/cookieCatcher', function(req, res) {
  console.log('!!!Cookie catcher!!!')
  console.log(JSON.stringify(req.query, null, 2));
  console.log('!!!Cookie catcher!!!')
  res.json({});
});

app.get('/csrfLogout', function(req,res){
  res.render('csrfLogout');
})

app.get('/csrfPost', function(req,res){
  res.render('csrfPost');
})

app.listen(process.env.PORT || 3000);
