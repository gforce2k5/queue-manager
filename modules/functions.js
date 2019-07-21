const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');

// DATA STORAGE
const tokens = [];

module.exports = {
  generateToken(id) {
    let token = bcrypt.hashSync(uuidv4(), parseInt(id));
    tokens[id] = token;
    return token;
  },

  getToken(index) {
    return tokens[index];
  }
}