const express = require('express');
const functions = require('../modules/functions');
const Terminal = require('../models/terminal');
const Customer = require('../models/customer');
const data = require('../modules/data');
const middlewares = require('../modules/middlewares');

const router = new express.Router();

// MIDDLEWARE

const checkToken = (req, res, next) => {
  const id = req.body.id;
  if (req.body.token == functions.getToken(id)) {
    functions.generateToken(id);
    next();
  } else {
    res.status(500).json({error: 'Eroor'});
  }
};

// ROUTES

router.get('/', (req, res) => {
  res.json(data.queue);
});

router.post('/', checkToken, async (req, res) => {
  try {
    const customer = await Customer.create({
      number: data.counter,
      arrivalTime: new Date(),
      email: req.body.email,
      resolved: false,
    });
    data.queue.push(customer);
    data.counter++;
    res.json({c: customer.number, token: functions.getToken(req.body.id)});
  } catch (err) {
    console.log(err);
    res.status(500).json({error: 'Error'});
  }
});

router.put('/:id', middlewares.isUserLoggedIn, async (req, res) => {
  const currentId = req.body.currentId;
  const terminalId = req.body.terminalId;
  const promises = [];

  if (req.params.id != '0') {
    promises.push(Customer.findByIdAndUpdate(req.params.id, {$set: {
      acceptTime: new Date(),
      accepted: true,
    }}, {new: true}));
  }

  if (currentId != 'undefined' && currentId != '') {
    promises.push(Customer.findByIdAndUpdate(currentId, {$set: {
      resolveTime: new Date(),
      resolved: true,
    }}, {new: true}));
  }

  try {
    const customers = await Promise.all(promises);
    await Terminal.findByIdAndUpdate(terminalId,
      req.params.id != '0' ? {$set: {currentCustomer: customers[0]._id}}
                           : {$unset: {currentCustomer: undefined}});
    res.json(customers[0]);
    data.resolvedCustomer = customers.find((customer) => customer.resolved);
  } catch (err) {
    console.log(err);
    res.json({error: 'Error'});
  }
});

module.exports = router;
