const express = require('express');
const passport = require('passport');

const data = require('../modules/data');
const middlewares = require('../modules/middlewares');
const User = require('../models/user');
const Terminal = require('../models/terminal');

const router = express.Router();

router.get('/', middlewares.isUserLoggedIn, async (req, res) => {
  try {
    const terminals = await Terminal.find();
    res.render('index', {
      pageTitle: 'Index',
      numberOfNumberGenerators: data.settings.numberOfNumberGenerators,
      activeGenerators: data.activeGenerators,
      terminals: terminals.map(terminal => {
        terminal.active = data.activeTerminals[terminal.tid - 1];
        return terminal;
      })
    });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.get('/register', middlewares.isAdmin, (req, res) => {
  res.render('auth/register', { pageTitle: 'Register' });
});

router.post('/register', middlewares.isAdmin, async (req, res) => {
  const user = new User({ ...req.body.user, username: req.body.username });
  if (req.body.password !== req.body.password2) return res.send('Passwords do not match');
  try {
    await User.register(user, req.body.password);
    res.redirect('/admin');
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.get('/login', (req, res) => {
  if (!req.user) res.render('auth/login', { pageTitle: 'Login' });
  else res.redirect('/');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
}));

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
})

module.exports = router;