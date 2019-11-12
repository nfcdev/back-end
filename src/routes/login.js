const express = require('express');
const router = express.Router();
const passport = require('../util/authentication').passport;
const authenticatedRequest = require('../util/authentication').authenticatedRequest;
const config = require('../../config');
const jwt = require('jsonwebtoken');

router.get(
  '/',
  function(req, res, next) {
    console.log('-----------------------------');
    console.log('/Start login handler');
    next();
  },
  passport.authenticate('samlStrategy')
);

router.get('/token', authenticatedRequest, function(req, res) {
  if (!req.isAuthenticated()) return res.send(401);
  var payload = {
    uid: req.user.uid,
    edPersonAffiliation: req.user.eduPersonAffiliation,
    email: req.user.email
  };

  var signOptions = {
    issuer: 'C4Solutions',
    subject: 'NFC Storage Tracker',
    audience: 'c4solutions.com',
    expiresIn: '12h',
    algorithm: 'RS256'
  };
  var privateKEY = config.saml.samlPrivateCert;
  var token = jwt.sign(payload, privateKEY, signOptions);
  res.send({ token });
});

router.post(
  '/callback',
  function(req, res, next) {
    console.log('-----------------------------');
    console.log('/Start login callback ');
    next();
  },
  passport.authenticate('samlStrategy', {
    failureRedirect: `${config.frontend.host}:${config.frontend.port}`
  }),
  function(req, res) {
    console.log('-----------------------------');
    console.log('login call back dumps');
    console.log(req.user);
    console.log('-----------------------------');
    console.log('Redirecting back to frontend application');

    res.redirect(`${config.frontend.host}:${config.frontend.port}`);
  }
);

module.exports = router;
