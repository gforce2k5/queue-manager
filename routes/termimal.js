const express = require('express');
const data = require('../modules/data');
const Customer = require('../models/customer');
const Terminal = require('../models/terminal');

const router = express.Router();

// INDEX
router.get('/', async (req, res) => {
  try {
    const terminals = await Terminal.find();
    res.json(terminals);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// SHOW
router.get('/:id', async (req, res) => {
  try {
    const terminal = await Terminal.findById(req.params.id).populate('currentCustomer').exec();
    res.render('terminal', {pageTitle: `Terminal ${terminal.tid}`, terminal: terminal});
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    await Terminal.findByIdAndUpdate(req.params.id, {$set: {
      currentCustomer: req.body.currentCustomer
    }});
  } catch (err) {
    res.sendStatus(500);
    console.log(err);
  }
})

// DESTROY
// CREATE
router.delete('/', async (req, res) => {
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
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = router;