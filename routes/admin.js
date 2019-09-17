const changeCase = require('change-case');
const express = require('express');
const data = require('../modules/data');
const fs = require('../modules/fs-promise');
const { isAdmin } = require('../modules/middlewares');
const { errHandler } = require('../modules/functions');

// ROUTERS
const dataRoutes = require('./admin/data');
const dashboardRoutes = require('./admin/dashboard');

const router = new express.Router();

// MIDDLEWARES
router.use(isAdmin);

router.get('/', (req, res) => {
  const formData = [];
  // eslint-disable-next-line guard-for-in
  for (key in data.form) {
    formData.push({
      name: {
        kebab: changeCase.kebab(key),
        sentence: changeCase.sentenceCase(key)
      },
      type: data.form[key],
      value: data.settings[key]
    });
  }
  res.render('admin', {
    pageTitle: 'Admin',
    form: formData
  });
});

router.post('/', async (req, res) => {
  const settings = {};
  // eslint-disable-next-line guard-for-in
  for (key in req.body) {
    const ckey = changeCase.camel(key);
    data.settings[ckey] = req.body[key];
    settings[ckey] = {
      type: data.form[ckey],
      value: req.body[key]
    };
  }

  try {
    await fs.writeFile(`${__dirname}/../settings/settings.json`, settings);
    res.flash('success', 'ההגדרות נשמרו בהצלחה');
    res.redirect('/admin');
  } catch (err) {
    errHandler(req, res, err, '/admin');
  }
});

// ROUTES
router.use('/data', dataRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
