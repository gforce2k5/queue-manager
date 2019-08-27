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
    const promises = [];
    const now = new Date();
    promises.push(this.getCustomersByDate(now));
    promises.push(this.loadData());
    try {
      const customers = (await Promise.all(promises))[0];
      data.queue = customers.filter((customer) => !customer.accepted);
      if (customers.length == 0) {
        data.counter = 1;
      } else {
        data.counter = customers[customers.length - 1].number + 1;
      }
      data.customersServed = customers.length - data.queue.length;
      data.hasInitialized = true;
      console.log('App Initialized');
    } catch (err) {
      console.log(err);
    }
  },

  async getCustomersByDate(date) {
    const morning = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate());
    const nextDay = new Date(morning);
    nextDay.setDate(morning.getDate() + 1);
    return Customer.find({
      arrivalTime: {
        $gte: morning,
        $lt: nextDay,
      },
    });
  },

  getCustomerTimes(customer) {
    if (customer && customer.resolved) {
      return {
        waitTime:
          Math.floor((customer.acceptTime - customer.arrivalTime) / 1000),
        resolveTime:
          Math.floor((customer.resolveTime - customer.acceptTime) / 1000),
      };
    } else {
      return undefined;
    }
  },

  async loadData() {
    let settings =
        await fs.readFile(`${__dirname}/../settings/settings.json`);
    settings = JSON.parse(settings);
    const form = {};

    // eslint-disable-next-line guard-for-in
    for (key in settings) {
      form[key] = settings[key].type;
      settings[key] = settings[key].value;
    }
    data.settings = settings;
    data.form = form;
  },
};
