const express = require('express');
const data = require('../../modules/data');
const {
  getCustomersByDate,
  convertSecondsToString,
  dateToString,
} = require('../../modules/functions');
const {
  errHandler,
  averageTimeArray,
} = require('../../modules/functions');

const router = new express.Router();

router.get('/', async (req, res) => {
  try {
    const customers = await getCustomersByDate(new Date());
    const [averageWaitTime, customersWaitTime] = averageTimeArray(customers);
    let dailyTimeAverageLastWeek = Array(7).fill().map(async (day, i) => {
      const date = new Date(new Date() - (i + 1) * 24 * 60 * 60 * 1000);
      return [date, (averageTimeArray(await getCustomersByDate(date)))[0]];
    });
    dailyTimeAverageLastWeek = await Promise.all(dailyTimeAverageLastWeek);
    res.render('dashboard/daily', {
      pageTitle: 'Dashboard',
      customersServed: data.customersServed,
      customersWaiting: data.queue.length,
      customersWaitTime: JSON.stringify(customersWaitTime),
      averageWaitTimeString: convertSecondsToString(averageWaitTime),
      averageWaitTime,
      dailyTimeAverageLastWeek,
      convertSecondsToString,
      dateToString,
    });
  } catch (err) {
    errHandler(req, res, err, '/admin');
  }
});

module.exports = router;
