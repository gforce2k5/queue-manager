const express = require('express');
const functions = require('../modules/functions');
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

// ROUTES

router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find({endTime: undefined});
    res.json(customers);
  } catch (err) {
    console.log(err);
    res.status(500).json({error: 'Error'});
  }
});

router.post('/', checkToken, async (req, res) => {
  try {
    const customer = await Customer.create({
      number: data.counter,
      arrivalTime: new Date(),
      email: req.body.email,
    });
    data.queue.push(customer);
    data.counter++;
    res.json({c: customer.number, token: functions.getToken(req.body.id)});
  } catch (err) {
    console.log(err);
    res.status(500).json({error: 'Error'});
  }
});

module.exports = router;