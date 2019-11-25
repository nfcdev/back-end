/* eslint-disable no-undef */

const config = {
  production: {
    'frontend-url': `${process.env.PROD_URL}`,
    'frontend-port': `${process.env.PROD_PORT}`,
    'backend-url': `${process.env.PROD_URL}`,
    'backend-port': `${process.env.PROD_PORT}`,
    jwtOptions: {
      secretOrKey: `${process.env.JWTSECRET}`,
    },
  },
  development: {
    'frontend-url': `${process.env.DEV_URL}`,
    'frontend-port': `${process.env.DEV_FRONTEND_PORT}`,
    'backend-url': `${process.env.DEV_URL}`,
    'backend-port': `${process.env.DEV_BACKEND_PORT}`,
    jwtOptions: {
      secretOrKey: `${process.env.JWTSECRET}`,
    },
  },
};

exports.get = function get(env) {
  return config[env];
};
