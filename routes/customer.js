const express = require('express');
const {getToken, generateToken} = require('../modules/functions');
const Terminal = require('../models/terminal');
const Customer = require('../models/customer');
const data = require('../modules/data');
const {isUserLoggedIn} = require('../modules/middlewares');
const {printCustomer} = require('../modules/printer');
const {errHandler} = require('../modules/functions');

const router = new express.Router();

// MIDDLEWARE

const checkToken = (req, res, next) => {
  const id = req.body.id;
  if (req.body.token == getToken(id)) {
    generateToken(id);
    next();
  } else {
    res.status(401).json({error: 'Invalid token'});
  }
};

// ROUTES

router.get('/', (req, res) => {
  res.json(data.queue);
});

router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer.accepted) {
      res.render('customer', {
        pageTitle: 'לקוח',
        customer,
        waitingBefore: data.queue.findIndex((foundCustomer) => {
          return foundCustomer._id.toString() == customer._id.toString();
        }),
      });
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    errHandler(req, res, err, '/');
  }
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
    res.json({c: customer.number, token: getToken(req.body.id)});
    if (data.settings.enablePrinter == 'true') {
      await printCustomer(customer);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({error: err.message});
  }
});

router.put('/:id', isUserLoggedIn, async (req, res) => {
  const currentId = req.body.currentId;
  const terminalId = req.body.terminalId;
  const promises = [];

  if (req.params.id != '0') {
    promises.push(
        Customer.findByIdAndUpdate(
            req.params.id,
            {
              $set: {
                acceptTime: new Date(),
                accepted: true,
              },
            },
            {new: true}
        )
    );
  }

  if (currentId != 'undefined' && currentId != '') {
    promises.push(
        Customer.findByIdAndUpdate(
            currentId,
            {
              $set: {
                resolveTime: new Date(),
                resolved: true,
              },
            },
            {new: true}
        )
    );
  }

  try {
    const customers = await Promise.all(promises);
    await Terminal.findByIdAndUpdate(
        terminalId,
      req.params.id != '0'
        ? {$set: {currentCustomer: customers[0]._id}}
        : {$unset: {currentCustomer: undefined}}
    );
    res.json(customers[0]);
    data.resolvedCustomer = customers.find((customer) => customer.resolved);
  } catch (err) {
    console.log(err);
    res.json({error: err.message});
  }
});

module.exports = router;
