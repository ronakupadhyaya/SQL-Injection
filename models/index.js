var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || require('./connect'));

var Donation = mongoose.model('donation', {
  amount: {
    type: Number,
    min: 1
  }
});

module.exports = {
  Donation: Donation
};
