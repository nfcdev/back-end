const express = require('express');
const router = express.Router();
const passport = require('../util/authentication').passport;
const employeeVerification = require('../util/external-verification');
const _ = require("lodash");
const config = require('../../config');
const jwt = require('jsonwebtoken');

var jwtOptions = config.jwtOptions

// Mock users
const users = config.mock_users;

router.post("/", function (req, res) {
  console.log("----POST TO /login----");

  if (req.body.name && req.body.password) {
    console.log("In if ==> name and password was sent so server");

    var name = req.body.name;
    var password = req.body.password;
  } else {
    res.status(401).json({ message: "missing information" });
    return;
  }
  console.log("name: " + name);
  console.log("password: " + password);

  console.log("users", users);
  /**
   * This function is used to check if the user exist in the employee database.
   * For now it is stubbed but will later be implemented.
   */
  employeeVerification({ name: name, "password": password });
  
  // usually this would be a database call:
  var user = users[_.findIndex(users, { name: name })];
  console.log("user", user);
  console.log("!user", !user);


  if (!user) {
    res.status(401).json({ message: "no user found" });
    return;
  }

  console.log("Should only be here if user exist");

  if (user.password === req.body.password) {
    // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
    var payload = { id: user.id, shortcode: name };
    var signOptions = {
      issuer: 'C4Solutions',
      subject: 'NFC Storage Tracker',
      audience: 'c4solutions.com',
      // expiresIn: '30000ms',
    };
    var token = jwt.sign(payload, jwtOptions.secretOrKey, signOptions);
    res.json({ message: "ok", token: token });
  } else {
    res.status(401).json({ message: "passwords did not match" });
  }
});


// The following route is just for testing
router.get("/secret", passport.authenticate('jwtStrategy', { session: false }), function (req, res) {
  console.log("----GET TO /login/secret----");
  res.json("Success! You can not see this without a token");
});

module.exports = router;
