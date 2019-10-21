const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const fs = require('./fs-promise');
const data = require('./data');
const Customer = require('../models/customer');
const User = require('../models/user');

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
    promises.push(User.find({ isAdmin: true }));
    try {
      const promisesResult = await Promise.all(promises);
      const customers = promisesResult[0];
      data.newInstallation = promisesResult[2].length === 0;
      data.queue = customers.filter(customer => !customer.accepted);
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
      date.getDate()
    );
    const nextDay = new Date(morning);
    nextDay.setDate(morning.getDate() + 1);
    return Customer.find({
      arrivalTime: {
        $gte: morning,
        $lt: nextDay
      }
    });
  },

  getCustomerTimes(customer) {
    if (customer && customer.resolved) {
      return {
        waitTime: Math.floor(
          (customer.acceptTime - customer.arrivalTime) / 1000
        ),
        resolveTime: Math.floor(
          (customer.resolveTime - customer.acceptTime) / 1000
        )
      };
    } else {
      return undefined;
    }
  },

  async loadData() {
    let settings = await fs.readFile(`${__dirname}/../settings/settings.json`);
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

  convertSecondsToString(num) {
    let hours = Math.floor(num / 3600);
    let minutes = Math.floor((num - hours * 3600) / 60);
    let seconds = num - hours * 3600 - minutes * 60;
    seconds = seconds.toFixed(0);

    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;
    if (seconds < 10) seconds = `0${seconds}`;
    return `${hours}:${minutes}:${seconds}`;
  },

  errHandler(req, res, err, redirect) {
    req.flash('error', err.message);
    console.log(err);
    res.redirect(redirect);
  },

  rev(str) {
    return str
      .split('')
      .reverse()
      .join('');
  },

  averageTimeArray(customers) {
    const { getCustomerTimes } = module.exports;
    const arr = customers
      .filter(customer => customer.resolved)
      .map(getCustomerTimes);
    return [
      arr.length > 0
        ? arr.reduce((acc, { waitTime }) => acc + waitTime, 0) / arr.length
        : 0,
      arr
    ];
  },

  dateToString(date) {
    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
  }
};
