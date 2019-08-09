const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('view', { pageTitle: 'View', data: data.lastCustomer });
});

module.exports = router;