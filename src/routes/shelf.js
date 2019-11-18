/* eslint-disable prefer-arrow-callback */
const express = require('express');

const router = express.Router();
const pool = require('../util/connect');

// creates a new shelf in a storageroom

router.post('/storageroom/:id', (request, response) => {
  const { id } = request.params;
  const newShelf = {
    shelf_name: request.body.shelf_name,
  };

  if (!newShelf.shelf_name) {
    response.status(400).send('Bad request');
  } else {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        response.status(500).send('Could not connect to server');
      } else {
        connection.beginTransaction((err0) => {
          if (err0) {
            console.log(err0);
            response.status(500).send('Could not start transaction');
          } else {
            // Creates the container that is the shelf
            let sql = 'INSERT INTO Container(current_storage_room) VALUES (?)';
            connection.query(sql, [id], (err1, result) => {
              if (err1) {
                connection.rollback(() => {
                  console.log(err1);
                  response.status(400).send('Bad query');
                });
              } else {
                // Creates the shelf for the previously created container
                sql = 'INSERT INTO Shelf(id, shelf_name) VALUES (?, ?)';
                connection.query(
                  sql,
                  [result.insertId, newShelf.shelf_name],
                  (err2, result1) => {
                    if (err2) {
                      connection.rollback(() => {
                        console.log(err2);
                        response.status(400).send('Bad query');
                      });
                    } else {
                      connection.commit(function (err3) {
                        if (err3) {
                          connection.rollback(function () {
                            console.log(err3);
                          });
                        } else {
                          console.log('Transaction Complete.');
                          connection.end();
                        }
                      });
                      response.json({
                        shelf_name: newShelf.shelf_name,
                        id: result.insertId,
                      });

                    }
                  },
                );
              }
            });
          }
        });
      }
     
    });
  }
});

router.put('/:id', (request, response) => {
  const { id } = request.params;
  const updatedShelf = request.body;
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'UPDATE Shelf SET shelf_name = ? WHERE id = ?';
      connection.query(sql, [updatedShelf.shelf_name, id], (err, result) => {
        connection.release();
        if (err) {
          console.log(err);
          response.status(400).send('Bad query');
        } else {
          response.json({ shelf_name: updatedShelf.shelf_name, id: id });
        }
      });
    }
  });
});

router.delete('/:id', (request, response) => {
  const { id } = request.params;
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'DELETE sh, co FROM Shelf sh JOIN Container co ON sh.id = co.id WHERE sh.id = ?';
      connection.query(sql, [id], (err, res) => {
        connection.release();
        if (err) {
          console.log(err);
          response.status(400).send('Bad query');
        } else if (res.affectedRows) {
          console.log('Shelf deleted');
          response.json({ result: 'ok' });
        } else {
          response.send('Shelf does not exist');
        }
      });
    }
  });
});

//get all shelves for a specific storage room
router.get('/storageroom/:storageroom_id', (request, response) => {
  const { storageroom_id } = request.params;
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'SELECT * FROM Shelf INNER JOIN Container ON Shelf.id = Container.id WHERE Shelf.id IN (SELECT id FROM Container WHERE Current_Storage_Room = ?)';
      connection.query(sql, [storageroom_id], (err, result) => {
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
