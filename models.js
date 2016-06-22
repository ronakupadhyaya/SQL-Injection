"use strict";

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || require('./connect'));

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
    key: {
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
  Post: mongoose.model('post', {
    body: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user'
    }
  })
};
