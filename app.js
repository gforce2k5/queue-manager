const bodyParser = require('body-parser');
const express = require('express');
const flash = require('connect-flash');
const http = require('http');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const socketIo = require('socket.io');

// MODULES
const functions = require('./modules/functions');

// MODELS
const User = require('./models/User');

// ROUTERS
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customer');
const helperRoutes = require('./routes/helper');
const numberRoutes = require('./routes/number');
const terminalRoutes = require('./routes/termimal');
const viewRoutes = require('./routes/view');

// SETTINGS
const app = express();
app.set('view engine', 'ejs');
require('dotenv').config();
const port = process.env.PORT || 3000;

// SOCKET.IO
const server = http.createServer(app);
require('./modules/io')(socketIo(server));

// MONGOOSE SETTINGS
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.DB_URL);

// MIDDLEWARES
const middlewares = require('./modules/middlewares');
app.use(methodOverride('_method'));
app.use(morgan('dev'));
// app.use(middlewares.logRequest);
app.use(express.static(`${__dirname}/public`));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(middlewares.saveUser);
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(middlewares.isInitialized);

// PASSPORT MIDDLEWARES
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// INIT
functions.init();

// ROUTES
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/customers', customerRoutes);
app.use('/helpers', helperRoutes);
app.use('/numbers', numberRoutes);
app.use('/terminals', terminalRoutes);
app.use('/view', viewRoutes);

server.listen(port, () => {
  console.log(`App running on ${port}`);
});
