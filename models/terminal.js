const mongoose = require('mongoose');

const terminalSchema = new mongoose.Schema({
  currentCustomer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  tid: Number
});

module.exports = mongoose.model('Terminal', terminalSchema);
