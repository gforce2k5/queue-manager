const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  number: Number,
  arrivalTime: {type: Date, defaily: Date.now},
  resolveTime: Date,
  endTime: Date,
  phone: Number,
});

module.exports = mongoose.model('Customer', customerSchema);