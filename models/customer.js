const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  number: Number,
  arrivalTime: { type: Date, default: Date.now },
  acceptTime: Date,
  resolveTime: Date,
  email: String,
  accepted: { type: Boolean, default: false },
  resolved: { type: Boolean, default: false },
});

module.exports = mongoose.model('Customer', customerSchema);