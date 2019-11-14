const express = require('express');
const router = express.Router();
const pool = require('../util/connect');

// deletes a shelf and its container

router.delete('/:id', (request, response) => {
    const id = request.params.id;
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        response.status(500).send('Could not connect to server');
      } else {
        const sql = 'DELETE sh, co FROM Shelf sh JOIN Container co ON sh.id = co.id WHERE sh.id = ?';
        connection.query(sql, [id], function (err, res) {
          connection.release();
          if (err) {
            console.log(err);
            response.status(400).send('Bad query');
          } else if (res.affectedRows) {
            console.log('Shelf deleted');
            response.json({ "result": "ok" });
          } else {
            response.send('Shelf does not exist');
          }
        });
      }
    });
  });

module.exports = router;