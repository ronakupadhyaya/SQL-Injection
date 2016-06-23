# Pair Programming Exercises: Steal This App

## Part 1: Hack

1. Go to [http://steal-this-app-horizons.herokuapp.com/](http://steal-this-app-horizons.herokuapp.com/)
1. Follow the instructions to exploit security bugs and make your way through the insecure app.

## Part 2: Fix

Now that we've learned how to break in, let's fix these security bugs. 
Clone [this repository](https://github.com/horizons-school-of-technology/steal-this-app) to get
started.

### Stage 1: Client-side login

Let's replace client-side validation with a server-side validation.

1. Create a `POST /` endpoint, in this endpoint check that the
  password is equal to `gingerbread`, if it is redirect to
  `/stage2` otherwise redirect back to `/stage1`
1. Make the form on `stage1.hbs` `POST` to `/`.

### Stage 2: Insecure cookies

We will use the Express library `cookie-session` to create cookies
that cannot be tampered with. This uses cryptography to detect unauthorized
changes.

Set up:

```javascript
var cookieSession = require('cookie-session');
app.use(cookieSession({keys: 'my secret key for cookies'}));
```

Now you can use `req.session` to store secure cookies. This works just
like `req.cookie`:

```javascript
app.get('/setCookie', {
  req.session.secureCookie = 'cookie value';
  res.send('Done!')
});

app.get('/checkCookie', {
  if (req.session.secureCookie === 'expected value') {
    res.send('Good!');
  } else {
    res.status(400).send('Bad!');
  }
});
```

### Stage 3: JSON endpoint

Ensure that `req.body.secret` is a string (and not an object or array).
If not, set status to `400` and respond with an error message.

## Done!

Congrats! You're done with Exercise 1, now go to [Exercise 2](exercise2.md).
