const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  number: Number,
  arrivalTime: {type: Date, defaily: Date.now},
  resolveTime: Date,
  endTime: Date,
  email: String,
});

module.exports = mongoose.model('Customer', customerSchema);