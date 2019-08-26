const express = require('express');
const data = require('../modules/data');
const middlewares = require('../modules/middlewares');
const Customer = require('../models/customer');
const Terminal = require('../models/terminal');

const router = new express.Router();

// SHOW
router.get('/:id', middlewares.isUserLoggedIn, async (req, res) => {
  try {
    const terminal =
      await Terminal.findById(req.params.id).populate('currentCustomer').exec();
    if (data.activeTerminals[terminal.tid - 1]) return res.end();
    res.render('terminal', {
      pageTitle: `Terminal ${terminal.tid}`,
      terminal: terminal,
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// UPDATE
router.put('/:id', middlewares.isUserLoggedIn, async (req, res) => {
  try {
    await Terminal.findByIdAndUpdate(req.params.id, {$set: {
      currentCustomer: req.body.currentCustomer,
    }});
  } catch (err) {
    res.sendStatus(500);
    console.log(err);
  }
});

// DESTROY
// CREATE
router.delete('/', middlewares.isAdmin, async (req, res) => {
  const p1 = Customer.deleteMany({resolved: false});
  const p2 = Terminal.deleteMany({});
  try {
    await Promise.all([p1, p2]);
    const promises = [];
    for (let i = 0; i < data.settings.numberOfTerminals; i++) {
      promises.push(Terminal.create({
        currentCustomer: undefined,
        tid: i + 1,
      }));
    }
    await Promise.all(promises);
    res.redirect('/admin');
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = router;
