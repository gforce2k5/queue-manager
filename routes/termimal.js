const express = require('express');
const data = require('../modules/data');
const {isUserLoggedIn, isAdmin} = require('../modules/middlewares');
const Customer = require('../models/customer');
const Terminal = require('../models/terminal');
const {errHandler} = require('../modules/functions');

const router = new express.Router();

// SHOW
router.get('/:id', isUserLoggedIn, async (req, res) => {
  try {
    const terminal = await Terminal.findById(req.params.id)
        .populate('currentCustomer')
        .exec();
    if (data.activeTerminals[terminal.tid - 1]) return res.end();
    res.render('terminal', {
      pageTitle: `Terminal ${terminal.tid}`,
      terminal: terminal,
    });
  } catch (err) {
    errHandler(req, res, err, '/');
  }
});

// UPDATE
router.put('/:id', isUserLoggedIn, async (req, res) => {
  try {
    await Terminal.findByIdAndUpdate(req.params.id, {
      $set: {
        currentCustomer: req.body.currentCustomer,
      },
    });
  } catch (err) {
    res.status(404).json({error: err.message});
    console.log(err);
  }
});

// DESTROY
// CREATE
router.delete('/', isAdmin, async (req, res) => {
  const p1 = Customer.deleteMany({resolved: false});
  const p2 = Terminal.deleteMany({});
  try {
    await Promise.all([p1, p2]);
    const promises = [];
    for (let i = 0; i < data.settings.numberOfTerminals; i++) {
      promises.push(
          Terminal.create({
            currentCustomer: undefined,
            tid: i + 1,
          })
      );
    }
    await Promise.all(promises);
    req.flash('success', 'הטרמינלים אופסו בהצלחה');
    res.redirect('/admin');
  } catch (err) {
    errHandler(req, res, err, '/admin');
  }
});

module.exports = router;
