const data = require('./data');
const { errHandler } = require('./functions');

module.exports = {
  isInitialized(req, res, next) {
    if (!data.hasInitialized)
      return res.status(500).send('Internal server error');
    if (data.newInstallation) {
      if (req.path == '/register') return next();
      return res.redirect('/register');
    }
    next();
  },

  isUserLoggedIn(req, res, next) {
    if (req.isAuthenticated()) next();
    else {
      errHandler(
        req,
        res,
        {
          message: 'נא התחבר'
        },
        '/login'
      );
    }
  },

  isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin) return next();
    if (data.newInstallation && req.path == '/register') return next();
    errHandler(
      req,
      res,
      {
        message: 'נא התחבר'
      },
      '/login'
    );
  },

  saveUser(req, res, next) {
    res.locals.user = req.user;
    res.locals.enableDarkMode = data.settings.enableDarkMode;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
  },

  logRequest(req, res, next) {
    console.log(req.connection.remoteAddress, req.path, req.method);
    next();
  }
};
