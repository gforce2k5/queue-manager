const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  email: String,
  isAdmin: {type: Boolean, default: false}
});

module.exports = mongoose.model('User', userSchema);