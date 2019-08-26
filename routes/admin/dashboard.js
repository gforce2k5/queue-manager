const express = require('express');
const data = require('../../modules/data');
const functions = require('../../modules/functions');

const router = new express.Router();

router.get('/', async (req, res) => {
  try {
    const customers = await functions.getCustomersByDate(new Date());
    const customersWaitTime = customers.map((customer) => {
      const waitTime =
        Math.floor((customer.acceptTime - customer.arrivalTime) / 1000);
      const resolveTime =
        Math.floor((customer.resolveTime - customer.acceptTime) / 1000);
      return {waitTime, resolveTime};
    });
    res.render('dashboard/daily', {
      pageTitle: 'Dashboard',
      customersServed: data.customersServed,
      customersWaiting: data.queue.length,
      customersWaitTime: JSON.stringify(customersWaitTime),
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = router;
