const express = require('express');
const router = express.Router();
const passport = require('../util/authentication').passport;
const authenticatedRequest = require('../util/authentication').authenticatedRequest;
const _ = require("lodash");
const config = require('../../config');
const jwt = require('jsonwebtoken');

var jwtOptions = config.jwtOptions

router.get(
  '/',
  function (req, res, next) {
    console.log('-----------------------------');
    console.log('/Start login handler');
    next();
  },
  passport.authenticate('samlStrategy')
);

// Mock users
const users = config.mock_users;

router.post("/", function (req, res) {
  console.log("----POST TO /login----");

  if (req.body.name && req.body.password) {
    console.log("In if ==> name and password was sent so server");

    var name = req.body.name;
    var password = req.body.password;
  }
  console.log("name: " + name);
  console.log("password: " + password);

  console.log("users", users);
  // usually this would be a database call:
  var user = users[_.findIndex(users, { name: name })];
  console.log("user", user);
  console.log("!user", !user);


  if (!user) {
    res.status(401).json({ message: "no such user found" });
    return;
    console.log("Respons have been sent");
  }

  console.log("Should only be here if user exist");

  if (user.password === req.body.password) {
    // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
    var payload = { id: user.id };
    var token = jwt.sign(payload, jwtOptions.secretOrKey);
    res.json({ message: "ok", token: token });
  } else {
    res.status(401).json({ message: "passwords did not match" });
  }
});

router.get('/token', authenticatedRequest, function (req, res) {
  // if (!req.isAuthenticated()) return res.send(401);
  // var payload = {
  //   uid: req.user.uid,
  //   edPersonAffiliation: req.user.eduPersonAffiliation,
  //   email: req.user.email
  // };
  var payload = {
    uid: 1337,
    edPersonAffiliation: "req.user.eduPersonAffiliation",
    email: "test.testsson@c4.se"
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
  function (req, res, next) {
    console.log('-----------------------------');
    console.log('/Start login callback ');
    next();
  },
  passport.authenticate('samlStrategy', {
    failureRedirect: `${config.frontend.host}:${config.frontend.port}`
  }),
  function (req, res) {
    console.log('-----------------------------');
    console.log('login call back dumps');
    console.log(req.user);
    console.log('-----------------------------');
    console.log('Redirecting back to frontend application');

    res.redirect(`${config.frontend.host}:${config.frontend.port}`);
  }
);

module.exports = router;
