const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const functions = require('./modules/functions');
const data = require('./modules/data');

// ROUTERS
const customerRoutes = require('./routes/customer');
const terminalRoutes = require('./routes/termimal');
const numberRoutes = require('./routes/number');

// SETTINGS
const app = express();
const server = http.createServer(app);

// SOCKET.IO
require('./modules/io')(socketIo(server));

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost:27017/queue');
app.use(express.static(`${__dirname}/public`));
app.use(session({
  secret: 'Guy has a cat named Panda',
  resave: false,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// MIDDLEWARES
app.use((req, res, next) => {
  if (!data.hasInitialized) res.status(500).send('Internal server error');
  else next();
})

// INIT
functions.init();

// ROUTES
app.get('/', async (req, res) => {
  res.render('index', { pageTitle: 'Index', numberOfNumberGenerators: data.settings.numberOfNumberGenerators});
});

app.get('/view', (req, res) => {
  res.render('view', { pageTitle: 'View', data: data.lastCustomer });
});

app.use('/numbers', numberRoutes);
app.use('/customers', customerRoutes);
app.use('/terminals', terminalRoutes);

server.listen(3000, () => {
  console.log('App running on port 3000');
});