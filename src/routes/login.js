const express = require("express");
const router = express.Router();
const passport = require("../util/authentication").passport;
const authenticatedRequest = require("../util/authentication").authenticatedRequest;

const config = require("../../config");

router.get(
  "/",
  function(req, res, next) {
    console.log("-----------------------------");
    console.log("/Start login handler");
    next();
  },
  passport.authenticate("samlStrategy")
);

router.get("/token", authenticatedRequest, function(req, res) {
  console.log("TOKEN REQUESTED");
  res.send({ token: "token-thingy" });
});

router.post(
  "/callback",
  function(req, res, next) {
    console.log("-----------------------------");
    console.log("/Start login callback ");
    next();
  },
  passport.authenticate("samlStrategy", {
    failureRedirect: `${config.frontend.host}:${config.frontend.port}`
  }),
  function(req, res) {
    console.log("-----------------------------");
    console.log("login call back dumps");
    console.log(req.user);
    console.log("-----------------------------");
    console.log("Redirecting back to frontend application");

    res.redirect(`${config.frontend.host}:${config.frontend.port}`);
  }
);

module.exports = router;
