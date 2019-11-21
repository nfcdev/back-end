/* eslint-disable no-undef */
const fs = require('fs');

const config = {
  host: 'http://localhost',
  port: 9000,
  frontend: {
    host: 'http://localhost',
    port: 9001,
  },
  jwtOptions: {
    secretOrKey: 'CHANGE THIS TO A REAL PRIVATE KEY IN PRODUCTION',
  },
  debug: process.env.NODE_ENV == 'debug',
};

module.exports = config;
