/* eslint-disable no-undef */

const config = {
  production: {
    frontendURL: `${process.env.PROD_URL}`,
    frontendport: '',
    backendURL: `${process.env.PROD_URL}`,
    backendport: `${process.env.PROD_PORT}`,
    jwtOptions: {
      secretOrKey: `${process.env.JWTSECRET}`,
    },
    APISUFFIX: `${process.env.APISUFFIX}`,
  },
  development: {
    frontendURL: `${process.env.DEV_URL_FRONTEND}`,
    frontendport: `${process.env.DEV_FRONTEND_PORT}`,
    backendURL: `${process.env.DEV_URL_BACKEND}`,
    backendport: `${process.env.DEV_BACKEND_PORT}`,
    jwtOptions: {
      secretOrKey: `${process.env.JWTSECRET}`,
    },
    APISUFFIX: `${process.env.APISUFFIX}`,
  },
  testing: {
    frontendURL: 'http://localhost',
    frontendport: '9001',
    backendURL: 'http://back-end',
    backendport: '9000',
    jwtOptions: {
      secretOrKey: 'testing',
    },
    APISUFFIX: '',
  },
};

exports.get = function get(env) {
  return config[env];
};
