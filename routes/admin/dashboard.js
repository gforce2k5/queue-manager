const express = require('express');
const data = require('../../modules/data');
const {
  getCustomersByDate,
  convertSecondsToString,
} = require('../../modules/functions');
const {errHandler} = require('../../modules/functions');

const router = new express.Router();

router.get('/', async (req, res) => {
  try {
    const customers = await getCustomersByDate(new Date());
    const customersWaitTime = customers.filter((customer) => customer.resolved)
        .map((customer) => {
          const waitTime =
            Math.floor((customer.acceptTime - customer.arrivalTime) / 1000);
          const resolveTime =
            Math.floor((customer.resolveTime - customer.acceptTime) / 1000);
          return {waitTime, resolveTime};
        });
    const averageWaitTime =
        customersWaitTime.length > 0 ? customersWaitTime
            .reduce((acc, times) => acc + times.waitTime, 0) /
            customersWaitTime.length : 0;
    res.render('dashboard/daily', {
      pageTitle: 'Dashboard',
      customersServed: data.customersServed,
      customersWaiting: data.queue.length,
      customersWaitTime: JSON.stringify(customersWaitTime),
      averageWaitTimeString: convertSecondsToString(averageWaitTime),
      averageWaitTime: averageWaitTime,
    });
  } catch (err) {
    errHandler(req, res, err, '/admin');
  }
});

module.exports = router;
