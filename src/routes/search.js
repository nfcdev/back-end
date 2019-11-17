const express = require('express');

const router = express.Router();

// Example: Establishing a connection and query to db
const pool = require('../../connect');

router.get('/', (request, response) => {
  // eslint-disable-next-line func-names
  pool.getConnection((err, connection) => {
    if (err) console.log(err);
    connection.query('SELECT * FROM Article', (_err, rows) => {
      connection.release();
      console.log('Data received from Db:\n');
      response.send(rows);
    });
  });
});


module.exports = router;
