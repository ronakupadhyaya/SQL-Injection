# Pair Programming Exercise: Steal This App: Exercise 2

## Getting started

1. Create a user account on [http://steal-this-app-horizons.herokuapp.com/exercise2](http://steal-this-app-horizons.herokuapp.com/exercise2)
1. Login!

## Part 1: Insecure Messenger

Insecure messenger lets you send messages to other users on Steal This App.
Unfortunately, it is vulnerable to Cross-Site Scripting (XSS) attacks.

### a. Sending on someone's behalf

The message body is not sanitized (i.e. escaped) before being rendered to the
page.
First we will exploit this vulnerability by making people send messages without
their knowledge.

1. Create a new user, we'll call this `User A`.
1. Send this message to `User A` from `User A`, refresh the page and check
   your console. You should see a message!

  ```html
  <script>
    console.log("I'm in your browser, running your JavaScripts");
  </script>
  ```

1. Make the `User A` send a message to via XSS. <br>
  Switch the `console.log()` statement with a `$.ajax()` call to
  make the same kind of `POST` request that the Send Message form
  on this page is making.

  ```html
  <script>
    $.ajax('/url of this page', {
      method: 'post',
      data: {
        // Form data goes here
      }
    })
  </script>
  ```
1. [Logout](https://steal-this-app-horizons.herokuapp.com/exercise2/logout)
  and create a new user, `User B`.
1. Send a specially crafted message from `User B` to `User A` and make sure
  that you can use the same attack across users.

### b. Drive by: sending on someone's behalf

There's another thing that's vulnerable on this page: the `success` query
parameter.
This parameter is also not sanitized before being rendered to the page, so
we can run JavaScript with it to.

1. [Success messages under normal operation](http://steal-this-app-horizons.herokuapp.com/exercise2/stage6?success=YOUR%20MESSAGE%20HERE)
1. [Whoops this link runs JavaScript](http://steal-this-app-horizons.herokuapp.com/exercise2/stage6?success=%3Cscript%3Econsole.log%28'Another%20day%2C%20another%20XSS'%29%3C%2Fscript%3E)
1. Create a link that makes someone send a message to you when they open
it in their browser.
1. See if you can get your friends to click on it.

#### Putting JavaScript in URLs

You can generate JavaScript to put in URLs using the `encodeURIComponent()`
like this:

```javascript
encodeURIComponent('<script>YOUR SCRIPT HERE</script>')
```

### c. Stealing cookies

A website is only as secure as its cookies. If you can steal someone's cookie
you can impersonate them. This page is vulnerable because it prints out messages
received on the page without escaping (i.e. sanitizing) HTML.

We can run JavaScript on other users' pages by sending them messages with this
page containing the &lt;script&gt; tag. Cookies are accessible (by default) in
JavaScript via `document.cookie`. So if we craft the right script tag, we can
steal their cookie!

  ```html
  <script>
    console.log('I can see your cookies!', document.cookies);
  </script>
  ```

## Part 2: Fix Insecure Messenger

TODO

```
{{{insecure}}}
```

```
{{secure}}
```

## Done!

Congrats! You're done with Exercise 2.
