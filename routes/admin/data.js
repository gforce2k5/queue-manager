const express = require('express');
const router = new express.Router();
const Costumer = require('../../models/customer');
const {getCustomerTimes} = require('../../modules/functions');

router.get('/', async (req, res) => {
  const start = new Date() - 24 * 60 * 60 * 1000;
  res.json(await getCustomers(start));
});

/**
 * Gets the customer waiting and resolve times
 * @param {Date} start
 * @param {Date} end
 */
async function getCustomers(start, end = Date.now()) {
  const customers = await Costumer.find({
    resolved: true,
    arrivalTime: {
      $gte: start,
      $lte: end,
    },
  });
  return customers.map(getCustomerTimes);
}

module.exports = router;
