const passport = require("passport");
var saml = require("passport-saml");
const config = require("../../config");

// This file was setup according to the guide found here:
// https://medium.com/disney-streaming/setup-a-single-sign-on-saml-test-environment-with-docker-and-nodejs-c53fc1a984c9

passport.serializeUser(function(user, done) {
  console.log("-----------------------------");
  console.log("serialize user");
  console.log(user);
  console.log("-----------------------------");
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  console.log("-----------------------------");
  console.log("deserialize user");
  console.log(user);
  console.log("-----------------------------");
  done(null, user);
});

var samlStrategy = new saml.Strategy(
  {
    callbackUrl: config.saml.samlCallbackUrl,
    entryPoint: config.saml.samlEntryPoint,
    issuer: config.saml.samlIssuer,
    identifierFormat: null,
    decryptionPvk: config.saml.samlDecryptionPvk,
    privateCert: config.saml.samlPrivateCert,
    validateInResponseTo: true,
    disableRequestedAuthnContext: true
  },
  function(profile, done) {
    return done(null, profile);
  }
);

passport.use("samlStrategy", samlStrategy);

module.exports = {
  passport,
  authenticatedRequest: function(req, res, next) {
    if (req.isAuthenticated()) {
      //req.isAuthenticated() returns true if user is logged in
      next();
    } else {
      res.send(401, "Unauthorized");
    }
  }
};
