const express = require('express');
const router = express.Router();
const pool = require('../util/connect');


//gets all articles belonging to a specifik branch
router.get('/branch/:branch_id', (request, response) => {
  const branchid = request.params.branch_id;
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      let sql = 'SELECT * FROM Article  WHERE id IN (SELECT article FROM StorageMap WHERE container IN (SELECT id FROM Container WHERE current_storage_room IN (SELECT id FROM StorageRoom WHERE branch = ?)))';
      connection.query(sql, [branchid], (err, result) => {
        connection.release();
        if (err) {
          console.log(err);
          response.status(400).send('Bad query');
        } else {
          console.log('Data received');
          response.send(result);
        }
      });
    }
  });
});

module.exports = router;