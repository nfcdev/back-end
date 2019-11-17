/* eslint-disable prefer-arrow-callback */
const express = require('express');

const router = express.Router();
const pool = require('../util/connect');

// creates a new package

router.post('/case/:id', (request, response) => {
  const { id } = request.params;
  const newPackage = {
    shelf: request.body.shelf,
    current_storage_room: request.body.current_storage_room,
  };

  if (!newPackage.shelf || !newPackage.current_storage_room) {
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
            // Creates the container that is the package
            let sql = 'INSERT INTO Container(current_storage_room) VALUES (?)';
            connection.query(sql, [newPackage.current_storage_room], function (
              err1,
              result,
            ) {
              if (err1) {
                connection.rollback(function () {
                  console.log(err1);
                  response.status(400).send('Bad query');
                });
              } else {
                // Calculates how many packages the case has already to be able to get an accurate package_number
                sql = 'SELECT COUNT(package_number)+1 AS orderstamp FROM Package WHERE `case` = ?';
                connection.query(sql, [id], function (err2, result1) {
                  if (err2) {
                    connection.rollback(function () {
                      console.log(err2);
                      response.status(400).send('Bad query');
                    });
                  } else {
                    // Creates the package
                    sql = 'INSERT INTO Package(id, shelf, `case`, package_number) VALUES(?, ?, ?, (CONCAT ((SELECT reference_number FROM `Case` WHERE id = ?),"-K",?)))';
                    // Over 99 packages for a case is not supported with this solution
                    connection.query(
                      sql,
                      [
                        result.insertId,
                        newPackage.shelf,
                        id,
                        id,
                        ('0' + result1[0].orderstamp).slice(-2),
                      ],
                      function (err3, result2) {
                        if (err3) {
                          connection.rollback(function () {
                            console.log(err3);
                            response.status(400).send('Bad query');
                          });
                        } else {
                          // Gets the package_number for an accurate return message. Maybe possible to do in a better way, but this works.
                          sql = 'SELECT package_number AS pn FROM Package WHERE id=?';
                          connection.query(sql, [result.insertId], function (
                            err4,
                            result3,
                          ) {
                            if (err4) {
                              connection.rollback(function () {
                                console.log(err4);
                                response.status(400).send('Bad query');
                              });
                            } else {
                              response.json({
                                package_number: result3[0].pn,
                                current_storage_room:
                                  newPackage.current_storage_room,
                                shelf: newPackage.shelf,
                                id: result.insertId,
                              });
                            }
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
      connection.release();
    });
  }
});

// Gets all packages
router.get('/', (request, response) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'SELECT * FROM Package INNER JOIN Container ON Package.id = Container.id';
      connection.query(sql, (err, result) => {
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

// gets all packages belonging to a specifik storageroom
router.get('/storageroom/:storageroom_id', (request, response) => {
  const { storageroom_id } = request.params;
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'SELECT * FROM Package INNER JOIN Container ON Package.id = Container.id WHERE Package.id IN (SELECT id FROM Container WHERE Current_Storage_Room = ?)';
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

// Gets all packagaes belonging to a specifik branch
router.get('/branch/:branch_id', (request, response) => {
  const { branch_id } = request.params;
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'SELECT * FROM Package INNER JOIN Container ON Package.id = Container.id WHERE Package.id IN (SELECT id FROM Container WHERE Current_Storage_Room IN (SELECT id FROM StorageRoom WHERE Branch = ?))';
      connection.query(sql, [branch_id], (err, result) => {
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

router.delete('/:id', (request, response) => {
  const { id } = request.params;
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'DELETE pa, co FROM Package pa JOIN Container co ON pa.id = co.id WHERE pa.id = ?';
      connection.query(sql, [id], function (err, res) {
        connection.release();
        if (err) {
          console.log(err);
          response.status(400).send('Bad query');
        } else if (res.affectedRows) {
          console.log('Package deleted');
          response.json({ result: 'ok' });
        } else {
          response.send('Package does not exist');
        }
      });
    }
  });
});


// Checks out a package
router.post('/check-out', (request, response) => {
  const checkOut = {
    package_number: request.body.package_number,
    comment: request.body.comment,
    storage_room: request.body.storage_room,
  };
  if (!checkOut.storage_room || !checkOut.package_number) {
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

            // Gets storageroom to compare with given storageroom from user
            let sql = 'SELECT current_storage_room FROM Container WHERE id = (SELECT id FROM Package WHERE package_number = ?) ';
            connection.query(sql, [checkOut.package_number], function (err2, result1) {
              if (err2) {
                connection.rollback(function () {
                  console.log(err2);
                  response.status(400).send('Bad query');
                });
              } else if (result1[0].current_storage_room == checkOut.storage_room) {
                // Selects all articles in the package that is getting checked out
                sql = 'SELECT article FROM StorageMap WHERE container = (SELECT id FROM Package WHERE package_number = ?)';

                connection.query(
                  sql,
                  [
                    checkOut.package_number,
                  ],
                  function (err3, result2) {
                    if (err3) {
                      connection.rollback(function () {
                        console.log(err3);
                        response.status(400).send('Bad query');
                      });
                    } else {
                      // Creates Storage events for all the articles in the package
                      for (a in result2) {
                        // User is hardcoded to "1" right now
                        sql = 'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article, branch) VALUES ("checked_out", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?, ?,(SELECT shelf_name FROM Shelf WHERE id = (SELECT shelf FROM Package WHERE package_number = ?)), (SELECT name FROM StorageRoom WHERE id = ?),?,(SELECT name FROM Branch WHERE id = (SELECT branch FROM StorageRoom WHERE id = ?)))';

                        connection.query(
                          sql,
                          [
                            checkOut.comment,
                            checkOut.package_number,
                            checkOut.package_number,
                            checkOut.storage_room,
                            result2[a].article,
                            checkOut.storage_room,
                          ],
                          function (err4, result3) {
                            if (err4) {
                              connection.rollback(function () {
                                console.log(err3);
                                response.status(400).send('Bad query');
                              });
                            } else {
                              console.log(result2[a].article + "created");

                            }
                          },
                        );
                      }
                      connection.commit(function (err5) {
                        if (err5) {
                          connection.rollback(function () {
                            console.log(err5);
                          });
                        } else {
                          console.log('Transaction Complete.');
                          connection.end();
                        }
                      });
                      response.json({ resultat: "Ok"});
                    }


                  });

              } else {
                response.status(400).send('Bad query');
              }
            });
          }
        });
      }
    });
  }
});

module.exports = router;
