const express = require('express');

const router = express.Router();
const jwt = require('jsonwebtoken');
const { passport } = require('../util/authentication');
const { authenticatedRequest } = require('../util/authentication');
const config = require('../../config');
const pool = require('../util/connect');

router.get(
  '/',
  (req, res, next) => {
    console.log('-----------------------------');
    console.log('/Start login handler');
    next();
  },
  passport.authenticate('samlStrategy'),
);

router.get('/token', authenticatedRequest, (req, res) => {
  if (!req.isAuthenticated()) return res.send(401);

  pool.getConnection((err, connection) => {
    if (err) {
      res.status(500).send('Cannot connect to server');
    }
    const sql = 'SELECT * FROM `User` WHERE employee_no = ?';
    connection.query(sql, [req.user.uid], (queryErr, rows) => {
      connection.release();
      if (queryErr) {
        console.log('Query error:', queryErr);
        return res.status(400);
      }
      if (!rows.length || rows.length > 1) {
        return res.status(400).send('User not found');
      }
      console.log('User found. Creating and returning token.');

      const payload = {
        uid: rows[0].employee_no,
        role: rows[0].role,
        email: rows[0].email,
      };

      const signOptions = {
        issuer: 'C4Solutions',
        subject: 'NFC Storage Tracker',
        audience: 'c4solutions.com',
        expiresIn: '12h',
        algorithm: 'RS256',
      };
      const privateKEY = config.saml.samlPrivateCert;
      const token = jwt.sign(payload, privateKEY, signOptions);
      return res.send({ token });
    });
  });
});

router.post(
  '/callback',
  (req, res, next) => {
    console.log('-----------------------------');
    console.log('/Start login callback ');
    next();
  },
  passport.authenticate('samlStrategy', {
    failureRedirect: `${config.frontend.host}:${config.frontend.port}`,
  }),
  (req, res) => {
    pool.getConnection((err, connection) => {
      if (err) {
        res.status(500).send('Cannot connect to server');
      }
      let sql = 'SELECT * FROM `User` WHERE employee_no = ?';
      connection.query(sql, [req.user.uid], (queryErr, rows) => {
        if (queryErr) {
          connection.release();
          console.log('Query error:', queryErr);
          return res.status(400);
        }
        if (!rows.length) {
          console.log('Not an existing user, creating user in database.');
          sql = 'INSERT INTO `User` (`employee_no`, `email`, `role`) VALUES (?,?,?)';
          connection.query(sql, [req.user.uid, req.user.email, 'user'], (insertError) => {
            connection.release();
            if (insertError) {
              console.log('Error. Could not create user: ', insertError);
              return res.send(500);
            }
            console.log('User created. Redirecting back to frontend application');
            return res.redirect(`${config.frontend.host}:${config.frontend.port}`);
          });
        } else {
          console.log('User found, redirecting to frontend.');
          connection.release();
          return res.redirect(`${config.frontend.host}:${config.frontend.port}`);
        }
      });
    });
  },
);

module.exports = router;
