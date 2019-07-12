const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const functions = require('./modules/functions');

// SETTINGS
app.use(express.static(`${__dirname}/public`));
app.use(session({
  secret: 'Guy has a cat named Panda',
  resave: false,
  saveUninitialized: true
}));
app.set('view engine', 'ejs');

// DATA STORAGE
var counter = 1;
var queue = [];

// ROUTES
app.get('/', (req, res) => {
  if (req.query.hasOwnProperty('id'))
    res.render('index', {pageTitle: 'getNumber', token: functions.generateToken(req.query.id), id: req.query.id});
  else
    res.send('Error');
});

app.use('/enqueue', (req, res, next) => {
  var id = req.query.id;
  if (req.query.token == functions.getToken(id)) {
    functions.generateToken(id);
    next();
  } else
    res.send(JSON.stringify('ERROR'));
});

app.get('/enqueue', (req, res) => {
  queue.push(counter);
  res.send(JSON.stringify({c: counter++, token: functions.getToken(req.query.id)}));
});

app.listen(3000, () => {
  console.log('App running on port 3000');
});