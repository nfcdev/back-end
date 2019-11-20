/* eslint-disable prefer-arrow-callback */
const express = require('express');
const util = require('util');

const router = express.Router();
const pool = require('../util/connect');

// creates a new package


const makeDb = () => new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => (
    resolve({
      query(sql, args) {
        return util.promisify(connection.query)
          .call(connection, sql, args);
      },
      close() {
        return util.promisify(connection.release).call(connection);
      },
      beginTransaction() {
        return util.promisify(connection.beginTransaction)
          .call(connection);
      },
      commit() {
        return util.promisify(connection.commit)
          .call(connection);
      },
      rollback() {
        return util.promisify(connection.rollback)
          .call(connection);
      },
    })
  ));
});

router.post('/', async (request, response) => {
  const db = await makeDb();
  const newPackage = {
    shelf: request.body.shelf,
    current_storage_room: request.body.current_storage_room,
    reference_number: request.body.reference_number,
  };

  if (!newPackage.shelf || !newPackage.current_storage_room || !newPackage.reference_number) {
    response.status(400).send('Bad Request');
    return;
  }
  let containerId;
  let caseId;

  db.beginTransaction()
    .then(() => {
      // Create case if not exists
      db.query('INSERT INTO `Case` (reference_number) SELECT ? WHERE NOT EXISTS (SELECT * FROM `Case` WHERE reference_number= ?)',
        [newPackage.reference_number, newPackage.reference_number]);
    })
    .then(() => {
      const p1 = db.query('INSERT INTO Container(current_storage_room) VALUES (?)', [newPackage.current_storage_room]);
      const p2 = db.query('SELECT id FROM `Case` WHERE reference_number = ?', [newPackage.reference_number]);
      return Promise.all([p1, p2]);
    })
    .then(([newContainerResult, caseIdResult]) => {
      containerId = newContainerResult.insertId;
      caseId = caseIdResult[0].id;
      return db.query('SELECT COUNT(package_number)+1 AS orderstamp FROM Package WHERE `case` = ?', [caseId]);
    })
    .then((countResult) => db.query('INSERT INTO Package(id, shelf, `case`, package_number) VALUES (?, ?, ?, (CONCAT ((SELECT reference_number FROM `Case` WHERE id = ?),"-K",?)))', [
      containerId,
      newPackage.shelf,
      caseId,
      caseId,
      (`0${countResult[0].orderstamp}`).slice(-2),
    ]))
    .then(() => db.query('SELECT package_number AS pn FROM Package WHERE id=?', containerId))
    .then((newPackageResult) => Promise.all(newPackageResult, db.commit()))
    .then(([newPackageResult]) => {
      db.close();
      response.json({
        package_number: newPackageResult.pn,
        current_storage_room:
          newPackage.current_storage_room,
        shelf: newPackage.shelf,
        id: newPackageResult.insertId,
      });
    })
    .catch((err) => {
      console.log(err);
      db.rollback();
      db.close();
      response.send(400);
    });
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

// Checks in a package
router.post('/check-in', (request, response) => {
  const checkIn = {
    shelf: request.body.shelf,
    package_number: request.body.package_number,
    comment: request.body.comment,
    storage_room: request.body.storage_room,
  };
  if (!checkIn.shelf || !checkIn.storage_room || !checkIn.package_number) {
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
            // Updates shelf of package
            let sql = 'UPDATE Package SET shelf = ? WHERE package_number = ?';
            connection.query(sql, [checkIn.shelf, checkIn.package_number], function (
              err1,
              result,
            ) {
              if (err1) {
                connection.rollback(function () {
                  console.log(err1);
                  response.status(400).send('Bad query');
                });
              } else if (result.affectedRows) {
                // Updates storage room in container
                sql = 'UPDATE Container SET current_storage_room = ? WHERE id = (SELECT id FROM Package WHERE package_number = ?) ';
                connection.query(sql, [checkIn.storage_room, checkIn.package_number], function (err2, result1) {
                  if (err2) {
                    connection.rollback(function () {
                      console.log(err2);
                      response.status(400).send('Bad query');
                    });
                  } else if (result1.affectedRows) {
                    // Selects all articles in the package that is getting checked in
                    sql = 'SELECT article FROM StorageMap WHERE container = (SELECT id FROM Package WHERE package_number = ?)';

                    connection.query(
                      sql,
                      [
                        checkIn.package_number,
                      ],
                      function (err3, result2) {
                        if (err3) {
                          connection.rollback(function () {
                            console.log(err3);
                            response.status(400).send('Bad query');
                          });
                        } else {
                          // Creates Storage events for the articles in the package
                          for (a in result2) {
                            // User hardcoded to "1" right now
                            sql = 'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article, branch) VALUES ("checked_in", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?, ?,(SELECT shelf_name FROM Shelf WHERE id = ?), (SELECT name FROM StorageRoom WHERE id = ?),?,(SELECT name FROM Branch WHERE id = (SELECT branch FROM StorageRoom WHERE id = ?)))';

                            connection.query(
                              sql,
                              [
                                checkIn.comment,
                                checkIn.package_number,
                                checkIn.shelf,
                                checkIn.storage_room,
                                result2[a].article,
                                checkIn.storage_room,
                              ],
                              function (err4, result3) {
                                if (err4) {
                                  connection.rollback(function () {
                                    console.log(err3);
                                    response.status(400).send('Bad query');
                                  });
                                } else {
                                  console.log(`${result2[a].article}created`);
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
                          response.json({ resultat: 'Ok' });
                        }
                      },
                    );
                  } else {
                    response.send('Package does not exist');
                  }
                });
              } else {
                response.send('Package does not exist');
              }
            });
          }
        });
      }
    });
  }
});


module.exports = router;
