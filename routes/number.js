const express = require('express');
const { generateToken, errHandler } = require('../modules/functions');
const data = require('../modules/data');

const router = new express.Router();

router.get('/', (req, res) => {
  if (
    req.query.hasOwnProperty('id') &&
    !data.activeGenerators[parseInt(req.query.id)]
  ) {
    res.render('number', {
      pageTitle: 'Get Number',
      id: req.query.id,
      token: generateToken(req.query.id)
    });
  } else {
    errHandler(
      req,
      res,
      {
        message: 'לא ניתן לפתוח מכשיר ניפוק פעמיים'
      },
      '/'
    );
  }
});

module.exports = router;
