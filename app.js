const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const functions = require('./modules/functions');

// SCHEMAS
const Customer = require('./models/customer');
const User = require('./models/user');

// SETTINGS
mongoose.set('useNewUrlParser', true);
mongoose.connect('mongodb://localhost:27017/queue');
app.use(express.static(`${__dirname}/public`));
app.use(session({
  secret: 'Guy has a cat named Panda',
  resave: false,
  saveUninitialized: true
}));
app.set('view engine', 'ejs');

// DATA STORAGE
var hasInitialized = false;
var counter = undefined;
var queue = [];

// INIT
app.use((req, res, next) => {
  if (!hasInitialized) res.status(500).send('Internal server error');
  else next();
})

function init() {
  Customer.find()
  .then(customers => {
    queue = customers
    if (customers.length == 0) {
      counter = 1;
    } else {
      counter = queue[queue.length - 1].number + 1;
    }
    hasInitialized = true;ç
    console.log('App Initialized');
  })
  .catch(err => console.log(err));
}
init();

// ROUTES
app.get('/', (req, res) => {
  if (req.query.hasOwnProperty('id')) {
    res.render('index', {pageTitle: 'Get Number', id: req.query.id, token: functions.generateToken(req.query.id)});
  } else
    res.send('Error');
});

app.use('/enqueue', (req, res, next) => {
  var id = req.query.id;
  if (req.query.token == functions.getToken(id)) {
    functions.generateToken(id);
    next();
  } else
    res.send(JSON.stringify({error: 'Eroor'}));
});

app.get('/enqueue', async (req, res) => {
  Customer.create({
    number: counter,
    arrivalTime: new Date(),
  })
  .then(customer => {
    queue.push(customer);
    counter++;
    res.send(JSON.stringify({c: customer.number, token: functions.getToken(req.query.id)}));
  })
  .catch(err => {
    console.log(err)
    res.status(500).send(JSON.stringify({error: 'Error'}));
  });
});

app.listen(3000, () => {
  console.log('App running on port 3000');
});