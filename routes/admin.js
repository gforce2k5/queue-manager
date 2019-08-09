const express = require('express');
const middlewares = require('../modules/middlewares');

const router = express.Router();

router.get('/', middlewares.isAdmin, (req, res) => {
  res.render('admin', { pageTitle: 'Admin' });
});

module.exports = router;