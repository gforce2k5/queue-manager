const mongoose = require('mongoose');
const LocalStrategyMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  email: String,
  isAdmin: {type: Boolean, default: false},
});

userSchema.plugin(LocalStrategyMongoose);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
