const express = require('express');
const functions = require('../modules/functions');
const data = require('../modules/data');

const router = new express.Router();

router.get('/', (req, res) => {
  if (req.query.hasOwnProperty('id') &&
      !data.activeGenerators[parseInt(req.query.id)]) {
    res.render('number', {
      pageTitle: 'Get Number',
      id: req.query.id,
      token: functions.generateToken(req.query.id),
    });
  } else res.status(500).send('Error');
});

module.exports = router;
