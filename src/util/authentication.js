const passport = require('passport');
const passportJWT = require('passport-jwt');
const config = require('../../config');
const roleHandler = require('../util/internal-verification');

const { ExtractJwt } = passportJWT;
const JwtStrategy = passportJWT.Strategy;

// This file was setup according to the guides found here:
// https://jonathanmh.com/express-passport-json-web-token-jwt-authentication-beginners/
// https://itnext.io/implementing-json-web-tokens-passport-js-in-a-javascript-application-with-react-b86b1f313436
// https://medium.com/front-end-weekly/learn-using-jwt-with-passport-authentication-9761539c4314

const { jwtOptions } = config;
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');

// This strategy is used to verify an authenticated user. Use for protected routes.
const jwtStrategy = new JwtStrategy(jwtOptions, ((jwt_payload, next) => {
  roleHandler({ name: jwt_payload.shortcode }, ((callbackResponse) => {
    if (callbackResponse.code != 1) {
      console.log('User not found');
      next(null, false);
    } else {
      const userObj = callbackResponse.user;
      next(null, userObj);
    }
  }));
}));

// This strategy is used to authenticate and verify admin authorization. Use for admin protected routes.
const adminJwtStrategy = new JwtStrategy(jwtOptions, ((jwt_payload, next) => {
  roleHandler({ name: jwt_payload.shortcode }, ((callbackResponse) => {
    if (callbackResponse.code != 1) {
      console.log('User not found');
      next(null, false);
    } else {
      const userObj = callbackResponse.user;
      if (callbackResponse.user.role === 'admin') {
        next(null, userObj);
      } else {
        console.log('User is missing admin privileges');
        next(null, false);
      }
    }
  }));
}));

passport.use('jwtStrategy', jwtStrategy);
passport.use('adminJwtStrategy', adminJwtStrategy);


module.exports = {
  passport,
  authenticatedRequest: passport.authenticate('jwtStrategy', { session: false }),
  adminAuthorizedRequest: passport.authenticate('adminJwtStrategy', { session: false }),
};
