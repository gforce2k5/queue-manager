const express = require('express');
const functions = require('../modules/functions');
const Terminal = require('../models/terminal');
const Customer = require('../models/customer');
const data = require('../modules/data');

const router = express.Router();

// MIDDLEWARE

const checkToken = (req, res, next) => {
  const id = req.body.id;
  if (req.body.token == functions.getToken(id)) {
    functions.generateToken(id);
    next();
  } else
    res.status(500).json({error: 'Eroor'});
};

const userLoggedIn = (req, res, next) => {
  next();
}

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

router.put('/:id', userLoggedIn, async (req, res) => {
  const currentId = req.body.currentId;
  const terminalId = req.body.terminalId;

  const p1 = Customer.findByIdAndUpdate(req.params.id, {$set: {
    acceptTime: new Date(),
    accepted: true,
  }});

  const promises = [p1];
  if (currentId != '') {
    promises.push(Customer.findByIdAndUpdate(currentId, {$set: {
      resolveTime: new Date(),
      resolved: true,
    }}));
  }

  try {
    const customers = await Promise.all(promises);
    await Terminal.findByIdAndUpdate(terminalId, { $set: { currentCustomer: customers[0]._id } });
    res.json(customers[0]);
  } catch (err) {
    console.log(err);
    res.json({ error: 'Error' });
  }
});

module.exports = router;