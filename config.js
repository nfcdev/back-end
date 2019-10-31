/* eslint-disable no-undef */
const fs = require("fs");

const config = {
  host: "http://localhost",
  port: 9000,
  saml: {
    host: "http://localhost",
    port: 8080,
    samlEntryPoint: "http://localhost:8080/simplesaml/saml2/idp/SSOService.php",
    samlCallbackUrl: "http://localhost/login/callback",
    samlIssuer: "saml-nfc",
    samlDecryptionPvk: fs.readFileSync(__dirname + "/certs/key.pem", "utf8"),
    samlPrivateCert: fs.readFileSync(__dirname + "/certs/key.pem", "utf8")
  },
  frontend: {
    host: "http://localhost",
    port: 9001
  }
};

module.exports = config;
