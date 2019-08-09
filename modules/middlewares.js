const data = require('./data');

module.exports = {
  isInitialized(req, res, next) {
    if (!data.hasInitialized) res.status(500).send('Internal server error');
    else next();
  },
  
  isUserLoggedIn(req, res, next) {
    if (req.user) next();
    else res.redirect('/login');
  },

  isAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) next();
    else res.redirect('/login');
  },

  saveUser(req, res, next) {
    res.locals.user = req.user;
    next();
  },

  logRequest(req, res, next) {
    // console.log(req.path, req.method);
    next();
  },
};