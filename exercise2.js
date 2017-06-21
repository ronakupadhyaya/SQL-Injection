"use strict";

var router = require('express').Router();
var models = require('./models');
var passport = require('./passportInit')(router);

router.get('/', function(req, res) {
  res.render('login', {
    error: req.query.error,
    msg: req.query.msg
  });
});

router.post('/', passport.authenticate('local', {
  failureRedirect: '/exercise2?error=' + encodeURIComponent('Login failed. Bad username or password.'),
  successRedirect: '/exercise2/messenger'
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

router.get('/messenger', function(req, res) {
  res.header('X-XSS-Protection', 0);
  models.Message.find({
    to: req.user._id
  }).populate('from').exec(function(err, messages) {
    if (err) {
      res.status(500).render('messenger', {
        user: req.user,
        error: err.errmsg
      })
    } else {
      res.render('messenger', {
        user: req.user,
        messages: messages,
              success: req.query.success
      });
    }
  });
});

router.post('/messenger', function(req, res) {
  if (! req.body.body) {
    res.status(400).render('messenger', {
      user: req.user,
      error: "Post body is required."
    });
  } else if (! req.body.to) {
    res.status(400).render('messenger', {
      user: req.user,
      error: "To field is required."
    });
  } else {
    
    models.User.findOne({
      username: req.body.to
    }, function(err, toUser) {
      if (err) {
        res.status(400).render('stagemessenger', {
          user: req.user,
          error: err.errmsg
        });
      } else if (! toUser) {
        res.status(400).render('messenger', {
          user: req.user,
          error: "No such user: " + req.body.to
        });
      } else {
        var message = new models.Message({
          from: req.user._id,
          to: toUser._id,
          body: req.body.body
        });
        message.save(function(err) {
          if (err) {
            res.status(500).render('messenger', {
              user: req.user,
              error: err.errmsg,
            })
          } else {
            res.redirect('messenger?success=Sent!');
          }
        });
      }
    });
  }
});

router.post('/delete/:messageId', function(req, res) {
  if (! req.params.messageId) {
    res.status(400).render('messenger', {
      user: req.user,
      error: 'Message id missing'
    });
  } else {
    models.Message.findByIdAndRemove(req.params.messageId, function(err) {
      if (err) {
        res.status(400).render('messenger', {
          user: req.user,
          error: err.errmsg
        });
      } else {
        res.redirect('/exercise2/messenger?success=Deleted!');
      }
    });
  }
});

module.exports = router;
