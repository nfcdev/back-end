const express = require('express');
const router = express.Router();
const pool = require('../util/connect');


// Edits a shelf
router.put('/:id', (request, response) => {
    const id = request.params.id;
    const updatedShelf = request.body;
    pool.getConnection(function(err, connection) {
      if (err) {
        console.log(err);
        response.status(500).send('Could not connect to server');
      } else {
        const sql = 'UPDATE Shelf SET shelf_name = ? WHERE id = ?';
        connection.query(sql, [updatedShelf.shelf_name, id], function(err, result) {
          connection.release();
          if (err) {
            console.log(err);
            response.status(400).send('Bad query');
          } else {
            response.json({shelf_name: updatedShelf.shelf_name, id: id});
          }
        });
      }
    });
  });

module.exports = router;