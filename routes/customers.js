const express = require('express');
const functions = require('../modules/functions');
const Customer = require('../models/customer');
const data = require('../modules/data');

const router = express.Router();

router.use('/', (req, res, next) => {
  const id = req.body.id;
  if (req.body.token == functions.getToken(id)) {
    functions.generateToken(id);
    next();
  } else
    res.status(500).send(JSON.stringify({error: 'Eroor'}));
});

router.put('/',  async (req, res) => {
  try {
    const customer = await Customer.create({
      number: data.counter,
      arrivalTime: new Date(),
    });
    data.queue.push(customer);
    data.counter++;
    res.send(JSON.stringify({c: customer.number, token: functions.getToken(req.body.id)}));
  } catch (err) {
    console.log(err);
    res.status(500).send(JSON.stringify({error: 'Error'}));
  }
});

module.exports = router;