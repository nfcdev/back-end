const express = require('express');
const router = express.Router();
const passport = require('../util/authentication').passport;
const employeeVerification = require('../util/external-verification');
const roleHandler = require('../util/internal-verification')
const _ = require("lodash");
const config = require('../../config');
const jwt = require('jsonwebtoken');

var jwtOptions = config.jwtOptions

// Mock users
const users = config.mock_users;

router.post("/", function (req, res) {
  console.log("----POST TO /login----");

  if (req.body.name) {
    console.log("In if ==> name was sent so server");

    var name = req.body.name;
  } else {
    res.status(401).json({ message: "missing information" });
    return;
  }
  console.log("name: " + name);
  /**
   * This function is used to check if the user exist in the employee database.
   * For now it is stubbed but will later be implemented.
   * TODO: implement promise here!
   */
  var responseCode = employeeVerification({ name: name });
  if (responseCode != 1) {
    res.status(401).json({ message: "Error occurred when verifying employee. Code was: " + responseCode });
    return;
  }

  /**
   * Below it is verified if the user exist in the material tracking system.
   * If so the role is checked.
   * If not, the user is added with basic user privilege 
   */
  // usually this would be a database call:
  roleHandler({ name: name }, ((callbackResponse) => {
    console.log("callbackResponse from roleHandler", callbackResponse);
    console.log("After roleHandler");
    if (callbackResponse.code != 1) {
      res.status(500).json(callbackResponse);
      return;
    }
    console.log("Should only be here if user exist");
    let userObj = callbackResponse.user;
    var payload = { id: userObj.id, shortcode: userObj.shortcode, role: userObj.role };
    var signOptions = {
      issuer: 'C4Solutions',
      subject: 'NFC Storage Tracker',
      audience: 'c4solutions.com',
      // expiresIn: '30000ms',
    };
    var token = jwt.sign(payload, jwtOptions.secretOrKey, signOptions);
    res.json({ message: "ok", token: token });

  }));
});


// The following route is just for testing
router.get("/secret", passport.authenticate('jwtStrategy', { session: false }), function (req, res) {
  console.log("----GET TO /login/secret----");
  res.json("Success! You can not see this without a token");
});

module.exports = router;
