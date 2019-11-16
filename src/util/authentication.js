const _ = require("lodash");
const passport = require('passport');
const config = require('../../config');
var jwt = require('jsonwebtoken');
var passportJWT = require("passport-jwt");
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

// This file was setup according to the guides found here:
// https://jonathanmh.com/express-passport-json-web-token-jwt-authentication-beginners/
// https://itnext.io/implementing-json-web-tokens-passport-js-in-a-javascript-application-with-react-b86b1f313436
// https://medium.com/front-end-weekly/learn-using-jwt-with-passport-authentication-9761539c4314

var users = config.mock_users


passport.serializeUser(function(user, done) {
  /*
  console.log('-----------------------------');
  console.log('serialize user');
  console.log(user);
  console.log('-----------------------------');
  */
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  /*
  console.log('-----------------------------');
  console.log('deserialize user');
  console.log(user);
  console.log('-----------------------------');
  */
  done(null, user);
});

var jwtOptions = config.jwtOptions
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT')

var jwtStrategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  // usually this would be a database call:
  var user = users[_.findIndex(users, {id: jwt_payload.id})];
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

passport.use('jwtStrategy', jwtStrategy);

module.exports = {
  passport,
  authenticatedRequest: function(req, res, next) {
    // Don't require authenticated requests in debug mode
    if (req.isAuthenticated() || config.debug) {
      //req.isAuthenticated() returns true if user is logged in
      next();
    } else {
      res.send(401, 'Unauthorized');
    }
  }
};
