/* eslint-disable prefer-arrow-callback */
const express = require('express');
const router = express.Router();
const pool = require('../util/connect');
const { authenticatedRequest, adminAuthorizedRequest } = require('../util/authentication');

// gets all cases
router.get('/', authenticatedRequest, (request, response) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      // console.log(err);
      response.status(500).send('Cannot connect to server');
    }
    let sql = 'SELECT * FROM `Case`';
    connection.query(sql, (err, result) => {
      connection.release();
      if (err) {
        // console.log(err);
        response.status(500).send('Bad query');
      }
      // console.log('Data received');
      response.send(result);
    });
  });
});

// gets case of a specific ID
router.get("/:id", authenticatedRequest, (request, response) => {
  let id = request.params.id;
  pool.getConnection(function (err, connection) {
    if (err) {
      // console.log(err);
      response.status(500).send('Cannot connect to server');
    }
    let sql = 'SELECT * FROM `Case` WHERE ID = ?';
    connection.query(sql, [id], (err, result) => {
      connection.release();
      if (err) {
        // console.log(err);
        response.status(500).send('Bad query');
      }
      // console.log('Data received');
      response.send(result);
    });
  });
});

// Gets a case given its reference_number
router.get('/reference_number/:reference_number', authenticatedRequest, (request, response) => {
  const { reference_number } = request.params;
  pool.getConnection(function (err, connection) {
    if (err) {
      // console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'SELECT * FROM `Case` WHERE reference_number = ?';
      connection.query(sql, [reference_number], (err, result) => {
        connection.release();
        if (err) {
          // console.log(err);
          response.status(400).json({ error: err.message });
        } else if (result.length) {
          // console.log('Data received');
          response.send(result[0]);
        } else {
          response.status(400).json({ error: `No case with reference_number ${reference_number}` });
        }
      });
    }
  });
});

module.exports = router;
