"use strict";

var mongoose = require('mongoose');
if (! process.env.MONGODB_URI) {
  console.log('Error: MONGODB_URI is missing. Did you source env.sh ?');
  process.exit(1);
}
mongoose.connect(process.env.MONGODB_URI);

module.exports = {
  User: mongoose.model('user', {
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  }),
  Secret: mongoose.model('secret', {
    secret: {
      type: String,
      required: true
    }
  }),
  Donation: mongoose.model('donation', {
    amount: {
      type: Number,
      required: true
    }
  }),
  Message: mongoose.model('message', {
    body: {
      type: String,
      required: true
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user'
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user'
    }
  })
};
