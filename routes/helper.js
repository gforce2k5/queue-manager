const express = require('express');
const { isAdmin } = require('../modules/middlewares');
const { convertSecondsToString } = require('../modules/functions');
const router = new express.Router();

router.get('/convertToTime', isAdmin, (req, res) => {
  const num = Math.floor(parseFloat(req.query.num));
  if (isNaN(num)) return res.sendStatus(500);
  res.json(convertSecondsToString(num));
});

module.exports = router;
