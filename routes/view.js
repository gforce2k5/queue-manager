const express = require('express');
const data = require('../modules/data');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('view', { pageTitle: 'View', data: data.lastCustomer });
});

module.exports = router;