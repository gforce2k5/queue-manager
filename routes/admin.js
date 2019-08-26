const express = require('express');
const middlewares = require('../modules/middlewares');

// ROUTERS
const dataRoutes = require('./admin/data');
const dashboardRoutes = require('./admin/dashboard');

const router = new express.Router();

router.get('/', (req, res) => {
  res.render('admin', {pageTitle: 'Admin'});
});

// MIDDLEWARES
router.use(middlewares.isAdmin);

// ROUTES
router.use('/data', dataRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
