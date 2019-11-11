const passport = require('passport');
const saml = require('passport-saml');
const config = require('../../config');
const pool = require('../util/connect');

// This file was setup according to the guide found here:
// https://medium.com/disney-streaming/setup-a-single-sign-on-saml-test-environment-with-docker-and-nodejs-c53fc1a984c9

passport.serializeUser((user, done) => {
  pool.getConnection((err, connection) => {
    if (err) {
      done(err, null);
    }
    const sql = 'SELECT * FROM `User` WHERE employee_no = ?';
    connection.query(sql, [user.uid], (queryErr, rows) => {
      connection.release();
      if (queryErr) {
        done(queryErr, null);
      } else if (!rows.length || rows.length > 1) {
        done('Multiple or no user with defined user id.', null);
      } else {
        user.role = rows[0].role;
        done(null, user);
      }
    });
  });
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

const samlStrategy = new saml.Strategy(
  {
    callbackUrl: config.saml.samlCallbackUrl,
    entryPoint: config.saml.samlEntryPoint,
    issuer: config.saml.samlIssuer,
    identifierFormat: null,
    decryptionPvk: config.saml.samlDecryptionPvk,
    privateCert: config.saml.samlPrivateCert,
    validateInResponseTo: true,
    disableRequestedAuthnContext: true,
  },
  (profile, done) => done(null, profile),
);

passport.use('samlStrategy', samlStrategy);

module.exports = {
  passport,
  authenticatedRequest: function (req, res, next) {
    // Don't require authenticated requests in debug mode
    if (req.isAuthenticated() || config.debug) {
      // req.isAuthenticated() returns true if user is logged in
      next();
    } else {
      res.send(401, 'Unauthorized');
    }
  },
  adminRequest: function (req, res, next) {
    // Don't require authenticated requests in debug mode
    console.log('role:', req.user.role);

    if (req.isAuthenticated() && req.user.role === 'admin') {
      // req.isAuthenticated() returns true if user is logged in
      next();
    } else {
      res.send(403, 'Forbidden');
    }
  },
};
