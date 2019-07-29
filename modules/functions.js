const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const fs = require('./fs-promise');
const data = require('./data');
const Customer = require('../models/customer');

// DATA STORAGE
const tokens = [];

module.exports = {
  generateToken(id) {
    const token = bcrypt.hashSync(uuidv4(), parseInt(id));
    tokens[id] = token;
    return token;
  },

  getToken(index) {
    return tokens[index];
  },

  async init() {
    try {
      const promises = [];
      promises.push(Customer.find({ accepted: false }));
      promises.push(fs.readFile(`${__dirname}/../settings/settings.json`));
      const [customers, settings] = await Promise.all(promises);
      data.settings = JSON.parse(settings);
      data.queue = customers;
      if (customers.length == 0) {
        data.counter = 1;
      } else {
        data.counter =  data.queue[data.queue.length - 1].number + 1;
      }
      data.hasInitialized = true;
      console.log('App Initialized');
    } catch (err) {
      console.log(err);
    }
  }
}