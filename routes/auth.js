const express = require('express');
const passport = require('passport');

const data = require('../modules/data');
const {
  isUserLoggedIn,
  isAdmin,
} = require('../modules/middlewares');
const User = require('../models/user');
const Terminal = require('../models/terminal');
const {
  errHandler,
} = require('../modules/functions');

const router = new express.Router();

router.get('/', isUserLoggedIn, async (req, res) => {
  try {
    const terminals = await Terminal.find();
    res.render('index', {
      pageTitle: 'Index',
      numberOfNumberGenerators: data.settings.numberOfNumberGenerators,
      activeGenerators: data.activeGenerators,
      terminals: terminals.map((terminal) => {
        terminal.active = data.activeTerminals[terminal.tid - 1];
        return terminal;
      }),
    });
  } catch (err) {
    errHandler(req, res, err, '/');
  }
});

router.get('/register', isAdmin, (req, res) => {
  res.render('auth/register', {
    pageTitle: 'Register',
  });
});

router.post('/register', isAdmin, async (req, res) => {
  const user = new User({
    ...req.body.user,
    username: req.body.username,
  });
  if (req.body.password !== req.body.password2) {
    return errHandler(req, res, {
      message: 'הסיסמאות לא תואמות',
    }, '/register');
  }
  try {
    await User.register(user, req.body.password);
    req.flash('success', 'המשתמש נרשם בהצלחה');
    res.redirect('/admin');
  } catch (err) {
    errHandler(req, res, err, '/admin');
  }
});

router.get('/login', (req, res) => {
  if (!req.user) {
    res.render('auth/login', {
      pageTitle: 'Login',
    });
  } else res.redirect('/');
});

router.post(
    '/login',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
    })
);

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'יצאת בהצלחה מהמערכת');
  res.redirect('/login');
});

module.exports = router;
