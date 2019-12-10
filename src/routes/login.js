const express = require('express');

const router = express.Router();
const jwt = require('jsonwebtoken');
const { authenticatedRequest, adminAuthorizedRequest } = require('../util/authentication');
const employeeVerification = require('../util/external-verification');
const roleHandler = require('../util/internal-verification');
const config = require('../../config').get(process.env.NODE_ENV);

const { jwtOptions } = config;

// Mock users
router.post('/', (req, res) => {
  // console.log('----POST TO /login----');

  if (req.body.name) {
    // console.log('In if ==> name was sent so server');
    var { name } = req.body;
  } else {
    res.status(401).json({ message: 'missing information' });
    return;
  }
  // console.log(`name: ${name}`);
  /**
   * This function is used to check if the user exist in the employee database.
   * For now it is stubbed but will later be implemented.
   * TODO: implement promise here!
   */
  const responseCode = employeeVerification({ name: name });
  if (responseCode != 1) {
    res.status(401).json({ message: `Error occurred when verifying employee. Code was: ${responseCode}` });
    return;
  }

  /**
   * Below it is verified if the user exist in the material tracking system.
   * If so the role is checked.
   * If not, the user is added with basic user privilege
   */
  roleHandler({ name: name }, ((callbackResponse) => {
    // console.log('callbackResponse from roleHandler', callbackResponse);
    // console.log('After roleHandler');
    if (callbackResponse.code != 1) {
      res.status(500).json(callbackResponse);
      return;
    }
    // console.log('Should only be here if user exist');
    const userObj = callbackResponse.user;
    const payload = { id: userObj.id, shortcode: userObj.shortcode, role: userObj.role };
    const signOptions = {
      issuer: 'C4Solutions',
      subject: 'NED',
      audience: 'c4solutions.com',
      // expiresIn: '30000ms',
    };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, signOptions);
    res.json({ message: 'ok', token: token });
  }));
});


// The following route is just for testing
router.get('/secret', authenticatedRequest, (req, res) => {
  // console.log('----GET TO /login/secret----');
  res.json({ message: 'Success!', user: req.user });
});

router.get('/admin', adminAuthorizedRequest, (req, res) => {
  // console.log('----GET TO /login/secret----');
  res.json({ message: 'Success!', user: req.user });
});

module.exports = router;
