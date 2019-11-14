const express = require("express");
const router = express.Router();
const pool = require("../util/connect");

router.get('/', (request, response) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        console.log(err);
        response.status(500).send('Cannot connect to server');
      }
      const sql = 'SELECT * FROM Shelf';
      connection.query(sql, (err, result) => {
        connection.release();
        if (err) {
          console.log(err);
          response.status(400).send('Bad query');
        }
        console.log('Data received');
        response.send(result);
      });
    });
  });
  
// creates a new package

router.post('/storageroom/:id', (request, response) => {
  const id = request.params.id;
  const newShelf = {
      shelf_name: request.body.shelf_name;
  }

  if (!newPackage.shelf_name) {
      response.status(400).send('Bad request');
  } else {
      pool.getConnection(function (err, connection) {

          if (err) {
              console.log(err);
              response.status(500).send('Could not connect to server');
          } else {
              connection.beginTransaction(function (err0) {
                  if (err0) {
                      console.log(err0);
                      response.status(500).send('Could not start transaction');

                  } else {
                      // Creates the container that is the shelf
                      let sql = 'INSERT INTO Container(current_storage_room) VALUES (?)';
                      connection.query(sql, [id], function (err1, result) {

                          if (err1) {
                              connection.rollback(function () {
                                  console.log(err1);
                                  response.status(400).send('Bad query');
                              });

                          } else {
                              // Creates the shelf for the previously created container
                              sql = 'INSERT INTO Shelf(id, shelf_name) VALUES (?, ?)';
                              connection.query(sql, [result.insertId, newShelf.shelf_name], function (err2, result1) {
                                  if (err2) {
                                      connection.rollback(function () {
                                          console.log(err2);
                                          response.status(400).send('Bad query');
                                      });


                                  } else {
                                    response.json({shelf_name: newShelf.shelf_name, id: result.insertId});
                                     

                                  }

                              })

                          }
                      });
                  }
              });
          }
          connection.release();

      });
  }
});


module.exports = router;