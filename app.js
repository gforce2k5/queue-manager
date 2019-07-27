const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const functions = require('./modules/functions');
const data = require('./modules/data');

// SCHEMAS
const Customer = require('./models/customer');
const User = require('./models/user');

// ROUTERS
const customerRoutes = require('./routes/customers');

// SETTINGS
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
mongoose.set('useNewUrlParser', true);
mongoose.connect('mongodb://localhost:27017/queue');
app.use(express.static(`${__dirname}/public`));
app.use(session({
  secret: 'Guy has a cat named Panda',
  resave: false,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// DATA STORAGE
let hasInitialized = false;

// INIT
app.use((req, res, next) => {
  if (!hasInitialized) res.status(500).send('Internal server error');
  else next();
})

async function init() {
  try {
    const customers = await Customer.find();
    data.queue = customers
    if (customers.length == 0) {
      data.counter = 1;
    } else {
      data.counter =  data.queue[data.queue.length - 1].number + 1;
    }
    hasInitialized = true;
    console.log('App Initialized');
  } catch (err) {
    console.log(err);
  }
}
init();

// SOCKET.IO
io.on('connection', (socket) => {
  socket.on('enqueue', () => {
    io.emit('enqueue-done', JSON.stringify(data.queue[data.queue.length - 1]));
  });
});

// ROUTES
app.get('/', (req, res) => {
  if (req.query.hasOwnProperty('id')) {
    res.render('index', {pageTitle: 'Get Number', id: req.query.id, token: functions.generateToken(req.query.id)});
  } else res.status(500).send('Error');
});

app.get('/terminal', (req, res) => {
  res.render('terminal', {pageTitle: 'Terminal'});
});

app.use('/customers', customerRoutes);

server.listen(3000, () => {
  console.log('App running on port 3000');
});