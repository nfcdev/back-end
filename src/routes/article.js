/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-const-assign */
/* eslint-disable camelcase */
/* eslint-disable no-shadow */
const express = require('express');
const util = require('util');

const router = express.Router();

// Example: Establishing a connection and query to db
const pool = require('../util/connect');

//  Process an article with specific storage-room id
router.post('/process', (req, res) => {
  const processArticle = {
    material_number: req.body.material_number,
    comment: req.body.comment,
    storage_room: req.body.storage_room,
  };
  if (!processArticle.material_number || !processArticle.storage_room) {
    res.status(400).send('Bad request');
  } else {
    let sql1 = 'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, branch, article)';
    sql1 += 'SELECT "processed", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?,';
    sql1 += ' CASE WHEN EXISTS (select package_number from Package where id  = (select container from StorageMap where article = (select id from Article where material_number = ?)))';
    sql1 += " THEN (select package_number from Package where id  = (select container from StorageMap where article = (select id from Article where material_number = ?))) ELSE NULL END as package,";
    sql1 += ' Shelf.shelf_name, StorageRoom.name as "storageroom", Branch.name, Article.id FROM Shelf, StorageRoom, Branch, Article WHERE';
    sql1 += ' (Shelf.id = (select container from StorageMap where article = (select id from Article where material_number = ?)) OR Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = (select id from Article where material_number = ?)))) AND';
    sql1 += ' StorageRoom.id = ? AND';
    sql1 += ' Branch.id = (select branch from StorageRoom where id=?) AND';
    sql1 += ' Article.material_number = ?';

    let array1 = [
      processArticle.comment,
      processArticle.material_number,
      processArticle.material_number,
      processArticle.material_number,
      processArticle.material_number,
      processArticle.storage_room,
      processArticle.storage_room,
      processArticle.material_number];


    let sql2 = 'UPDATE StorageMap SET container = NULL where article = (select id from Article where material_number = ?)';

    let array2 = [processArticle.material_number];


    let sql3 = 'select * from StorageEvent order by id desc limit 1';
    //sql3 = "select material_number from Article where id in (select article from StorageMap)";

    let sql4 = 'SELECT current_storage_room FROM Container WHERE id = (SELECT container FROM StorageMap WHERE article = (SELECT id from Article WHERE material_number = ?)) ';


            

    pool.getConnection((err0, connection) => {
      if (err0) {
        console.log(err0);
        return res.status(500).send('Could not connect to server');
      }
      else {
        connection.beginTransaction(function (err1) {
          if (err1) {
            console.log(err1);
            res.status(500).send('Could not start transaction');
          }
          else {


              connection.query(sql4, [processArticle.material_number], function (err3, result1) {
                if (err3 || !result1[0] || !result1[0].current_storage_room) {
                  connection.rollback(function () {
                    console.log(err3);
                    res.status(400).send('Bad query! Your article may have already been processed.');
                  });
                } else if (result1[0].current_storage_room == processArticle.storage_room) {




            connection.query(sql1, array1, function (err2, result2) { // inserts data into StorageEvent
              if (err2) {
                connection.rollback(function () {
                  console.log(err2);
                  res.status(400).send('Bad query');
                });
              }
              else {
                if (result2.affectedRows == 1) { // checks whether 1 entry was inserted in storageevent, ie, if the material number exists.

                  connection.query(sql2, array2, function (err4, result4) { //deletes entry in storagemap
                    if (err4) {
                      connection.rollback(function () {
                        console.log(err4);
                        res.status(400).send('Bad query');
                      });
                    }
                    else {
                      connection.query(sql3, function (err5, result5) { // displays storageevent entry with highest id
                        if (err5) {
                          connection.rollback(function () {
                            console.log(err5);
                            res.status(400).send('Bad query');
                          });
                        }
                        else {
                          connection.commit(function (err9) {
                            if (err9) {
                              connection.rollback(function () {
                                console.log(err9);
                              });
                            }
                            else {
                              res.send(result5[0]);
                              console.log('Transaction Complete.');
                            }
                          });
                        }
                      });
                    }
                  });
                }
                
              }
            });
          }
          else {
            res.status(400).send('Bad query!');
          }
          });
          }
        });
        connection.release();
      }
    });
  }
});

// Checks out article
router.post('/check-out', (request, response) => {
  const checkOut = {
    material_number: request.body.material_number,
    comment: request.body.comment,
    storage_room: request.body.storage_room,
  };
  if (!checkOut.storage_room || !checkOut.material_number) {
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
            sql = 'SELECT current_storage_room FROM Container WHERE id = (SELECT container FROM StorageMap WHERE article = (SELECT id from Article WHERE material_number = ?)) ';
            connection.query(sql, [checkOut.material_number], function (err2, result1) {
              if (err2 || !result1[0] || !result1[0].current_storage_room) {
                connection.rollback(function () {
                  console.log(err2);
                  response.status(400).send('Bad query! Your article may have already been checked out.');
                });
              } else if (result1[0].current_storage_room == checkOut.storage_room) {
                // Selects article that is getting checked out
                sql = 'SELECT article FROM StorageMap WHERE article = (SELECT id FROM Article WHERE material_number = ?)';

                connection.query(
                  sql,
                  [
                    checkOut.material_number,
                  ],
                  function (err3, result2) {
                    if (err3) {
                      connection.rollback(function () {
                        console.log(err3);
                        response.status(400).send('Bad query');
                      });
                    } else {
                      // Creates Storage event for the article
                      
                        // User is hardcoded to "1" right now
                        //sql = 'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article, branch) VALUES ("checked_out", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?, " - ", " - ", (SELECT name FROM StorageRoom WHERE id = ?),?,(SELECT name FROM Branch WHERE id = (SELECT branch FROM StorageRoom WHERE id = ?)))';

                        //sql = 'SELECT * FROM StorageEvent'


                        sql = 'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, branch, article)';
                        sql += 'SELECT "checked_out", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?,';
                        sql += ' CASE WHEN EXISTS (select package_number from Package where id  = (select container from StorageMap where article = (select id from Article where material_number = ?)))';
                        sql += " THEN (select package_number from Package where id  = (select container from StorageMap where article = (select id from Article where material_number = ?))) ELSE NULL END as package,";
                        sql += ' Shelf.shelf_name, StorageRoom.name as "storageroom", Branch.name, Article.id FROM Shelf, StorageRoom, Branch, Article WHERE';
                        sql += ' (Shelf.id = (select container from StorageMap where article = (select id from Article where material_number = ?)) OR Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = (select id from Article where material_number = ?)))) AND';
                        sql += ' StorageRoom.id = ? AND';
                        sql += ' Branch.id = (select branch from StorageRoom where id=?) AND';
                        sql += ' Article.material_number = ?';




                        connection.query(
                          sql,
                          [
                            checkOut.comment,
                            checkOut.material_number,
                            checkOut.material_number,
                            checkOut.material_number,
                            checkOut.material_number,
                            checkOut.storage_room,
                            checkOut.storage_room,
                            checkOut.material_number,
                          ],
                          function (err4, result3) {
                            if (err4) {
                              connection.rollback(function () {
                                console.log(err4);
                                response.status(400).send('Bad query');
                              });
                            } else {
                              console.log(result3);

                              sql = 'SELECT * FROM StorageEvent WHERE id = ?';
                              connection.query(
                                sql,
                                [
                                  result3.insertId,
                                ],
                                function (err5, result4) {
                                  if (err5) {
                                    connection.rollback(function () {
                                      console.log(err5);
                                      response.status(400).send('Bad query');
                                    });
                                  }
                                  response.send(result4[0]);
                                });

                              sql = 'UPDATE StorageMap SET container = NULL where article = (select id from Article where material_number = ?)';
                              connection.query(
                                sql,
                                [
                                  checkOut.material_number,
                                ],
                                function (err6, result5) {
                                  if (err6) {
                                    connection.rollback(function () {
                                      console.log(err6);
                                      response.status(400).send('Bad query');
                                    });
                                  } else {
                                    console.log(result5);
                                  }
                                })
                            }
                          },
                        );
                      
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

// Discards an article
router.post('/discard', (request, response) => {
  const discard = {
    material_number: request.body.material_number,
    comment: request.body.comment,
    storage_room: request.body.storage_room,
  };
  if (!discard.storage_room || !discard.material_number) {
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
            sql = 'SELECT current_storage_room FROM Container WHERE id = (SELECT container FROM StorageMap WHERE article = (SELECT id from Article WHERE material_number = ?)) ';
            connection.query(sql, [discard.material_number], function (err2, result1) {
              if (err2 || !result1[0] || !result1[0].current_storage_room) {
                connection.rollback(function () {
                  console.log(err2);
                  response.status(400).send('Bad query! Your article may have already been discarded.');
                });
              } else if (result1[0].current_storage_room == discard.storage_room) {
                // Selects article that is getting checked out
                sql = 'SELECT article FROM StorageMap WHERE article = (SELECT id FROM Article WHERE material_number = ?)';

                connection.query(
                  sql,
                  [
                    discard.material_number,
                  ],
                  function (err3, result2) {
                    if (err3) {
                      connection.rollback(function () {
                        console.log(err3);
                        response.status(400).send('Bad query');
                      });
                    } else {
                      // Creates Storage event for the article
                        // User is hardcoded to "1" right now
                        //sql = 'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article, branch) VALUES ("checked_out", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?, " - ", " - ", (SELECT name FROM StorageRoom WHERE id = ?),?,(SELECT name FROM Branch WHERE id = (SELECT branch FROM StorageRoom WHERE id = ?)))';

                        //sql = 'SELECT * FROM StorageEvent'


                        sql = 'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, branch, article)';
                        sql += 'SELECT "discarded", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?,';
                        sql += ' CASE WHEN EXISTS (select package_number from Package where id  = (select container from StorageMap where article = (select id from Article where material_number = ?)))';
                        sql += " THEN (select package_number from Package where id  = (select container from StorageMap where article = (select id from Article where material_number = ?))) ELSE NULL END as package,";
                        sql += ' Shelf.shelf_name, StorageRoom.name as "storageroom", Branch.name, Article.id FROM Shelf, StorageRoom, Branch, Article WHERE';
                        sql += ' (Shelf.id = (select container from StorageMap where article = (select id from Article where material_number = ?)) OR Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = (select id from Article where material_number = ?)))) AND';
                        sql += ' StorageRoom.id = ? AND';
                        sql += ' Branch.id = (select branch from StorageRoom where id=?) AND';
                        sql += ' Article.material_number = ?';




                        connection.query(
                          sql,
                          [
                            discard.comment,
                            discard.material_number,
                            discard.material_number,
                            discard.material_number,
                            discard.material_number,
                            discard.storage_room,
                            discard.storage_room,
                            discard.material_number,
                          ],
                          function (err4, result3) {
                            if (err4) {
                              connection.rollback(function () {
                                console.log(err4);
                                response.status(400).send('Bad query');
                              });
                            } else {
                              console.log(result3);

                              sql = 'SELECT * FROM StorageEvent WHERE id = ?';
                              connection.query(
                                sql,
                                [
                                  result3.insertId,
                                ],
                                function (err5, result4) {
                                  if (err5) {
                                    connection.rollback(function () {
                                      console.log(err5);
                                      response.status(400).send('Bad query');
                                    });
                                  }
                                  response.send(result4[0]);
                                });

                              sql = 'UPDATE StorageMap SET container = NULL where article = (select id from Article where material_number = ?)';
                              connection.query(
                                sql,
                                [
                                  discard.material_number,
                                ],
                                function (err6, result5) {
                                  if (err6) {
                                    connection.rollback(function () {
                                      console.log(err6);
                                      response.status(400).send('Bad query');
                                    });
                                  } else {
                                    console.log(result5);
                                  }
                                })
                            }
                          },
                        );
                      
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

// Register new article
router.post('/', (req, res) => {
  const newArticle = {
    material_number: req.body.material_number,
    description: req.body.description,
    case: req.body.case,
  };
  if (
    !newArticle.material_number
    || !newArticle.description
    || !newArticle.case
  ) {
    res.status(400).send('Bad request');
  } else {
    // eslint-disable-next-line consistent-return
    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Could not connect to server');
      }
      const sql = 'INSERT INTO Article(material_number, description, `case`) VALUES (?, ?, ?)';
      const article = [
        newArticle.material_number,
        newArticle.description,
        newArticle.case,
      ];
      console.log(sql);
      console.log(article);
      // eslint-disable-next-line consistent-return
      connection.query(sql, article, (err, result) => {
        connection.release();
        if (err) {
          console.log(err);
          return res.status(400).send('Bad query');
        }
        console.log('New article added');
        res.send(result);
      });
    });
  }
});

// Return all articles in DB, can be queried
router.get('/', (request, response) => {
  // eslint-disable-next-line func-names
  const { reference_number } = request.query;
  const { material_number } = request.query;
  const { location } = request.query;
  const { shelf } = request.query;
  const { package_number } = request.query;
  const { status } = request.query;

  sql_query = 'SELECT * FROM Article_information';

  let has_where_condition = false;
  const parameters = [];

  if (
    reference_number
    || material_number
    || location
    || shelf
    || package_number
    || status
  ) {
    sql_query += ' WHERE';
  }

  if (reference_number) {
    sql_query += ' reference_number = ?';
    has_where_condition = true;
    parameters.push(reference_number);
  }

  if (material_number) {
    if (has_where_condition) sql_query += ' and';
    sql_query += ' material_number = ?';
    has_where_condition = true;
    parameters.push(material_number);
  }

  if (package_number) {
    if (has_where_condition) sql_query += ' and';
    sql_query
      += ' package = ?';
    has_where_condition = true;
    parameters.push(package_number);
  }

  // Storageroom
  if (location) {
    if (has_where_condition) sql_query += ' and';
    sql_query += ' storage_room = ?';
    has_where_condition = true;
    parameters.push(location);
  }

  // Shelf
  if (shelf) {
    if (has_where_condition) sql_query += ' and';
    sql_query += ' shelf = ?';
    has_where_condition = true;
    parameters.push(shelf);
  }

  if (status) {
    if (has_where_condition) sql_query += ' and';
    sql_query += ' status = ?';
    has_where_condition = true;
    parameters.push(status);
  }

  sql_query += ' Order by material_number asc';


  pool.query(sql_query, parameters, (err, rows) => {
    console.log('Data received from Db:\n');
    response.send(rows);
  });
});

// Return single article
router.get('/:id', (req, res) => {
  const { id } = req.params;
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.status(500).send('Could not connect to server');
    } else {
      const sql_query = 'SELECT * FROM Article_information WHERE material_number = (SELECT material_number FROM Article WHERE id = ?)';
      connection.query(sql_query, [id], (err1, result) => {
        connection.release();
        if (err1) {
          console.log(err1);
          res.status(400).send('Bad query');
        } else {
          res.send(result);
        }
      });
    }
  });
});

// get all articles on a specifik shelf
router.get('/shelf/:id', (request, response) => {
  const { id } = request.params;
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'SELECT * FROM Article_information WHERE (material_number IN (SELECT material_number FROM Article WHERE id IN (SELECT article FROM StorageMap WHERE container IN (SELECT id FROM Shelf WHERE id = ?)))) OR  (material_number IN (SELECT material_number FROM Article WHERE id IN (SELECT article FROM StorageMap WHERE container IN (SELECT id FROM Package WHERE shelf = ?))))';
      connection.query(sql, [id, id], (err1, result) => {
        connection.release();
        if (err1) {
          console.log(err1);
          response.status(400).send('Bad query');
        } else {
          console.log('Data received');
          response.send(result);
        }
      });
    }
  });
});

// Return all articles for a specific case
router.get('/case/:id', (req, res) => {
  const { id } = req.params;
  // eslint-disable-next-line consistent-return
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.status(500).send('Could not connect to server');
    } else {
      const sql_query = 'SELECT * FROM Article_information WHERE reference_number = (SELECT reference_number FROM `Case` WHERE id = ?)';
      connection.query(sql_query, [id], (err1, result) => {
        connection.release();
        if (err1) {
          console.log(err1);
          res.status(400).send('Bad query');
        } else {
          res.send(result);
        }
      });
    }
  });
});

// Return all articles currently in a specific storage room
router.get('/storageroom/:id', (req, res) => {
  const { id } = req.params;
  // eslint-disable-next-line consistent-return
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.status(500).send('Could not connect to server');
    } else {
      const sql_query = 'SELECT * FROM Article_information WHERE storage_room = (SELECT name FROM StorageRoom WHERE id = ?)';
      connection.query(sql_query, [id], (err1, result) => {
        connection.release();
        if (err1) {
          console.log(err1);
          res.status(400).send('Bad query');
        } else {
          res.send(result);
        }
      });
    }
  });
});

// Return all articles in a specific package
router.get('/package/:id', (req, res) => {
  const { id } = req.params;
  // eslint-disable-next-line consistent-return
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      res.status(500).send('Could not connect to server');
    } else {
      const sql_query = 'SELECT * FROM Article_information WHERE package = (SELECT package_number FROM Package WHERE id = ?)';
      connection.query(sql_query, [id], (err1, result) => {
        connection.release();
        if (err1) {
          console.log(err1);
          res.status(400).send('Bad query');
        } else {
          res.send(result);
        }
      });
    }
  });
});

// gets all articles belonging to a specific branch
router.get('/branch/:id', (request, response) => {
  const { id } = request.params;
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql_query = 'SELECT * FROM Article_information WHERE branch = (SELECT name FROM Branch WHERE id = ?)';
      connection.query(sql_query, [id], (err1, result) => {
        connection.release();
        if (err1) {
          console.log(err1);
          response.status(400).send('Bad query');
        } else {
          response.send(result);
        }
      });
    }
  });
});

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

// Checks in an article
router.post('/check-in', async (request, response) => {
  const db = await makeDb();
  const checkIn = {
    shelf: request.body.shelf,
    package: request.body.package,
    comment: request.body.comment,
    storage_room: request.body.storage_room,
    material_number: request.body.material_number,
  };
  let selectresults;

  // checks so that storage_room, material_number and either package or shelf is provided. Package and shelf are tried with the logic of a xor gate.
  if (!checkIn.storage_room || !checkIn.material_number || !(!(checkIn.package && checkIn.shelf) && (checkIn.package || checkIn.shelf))) {
    response.status(400).send('Bad request');
  } else if (checkIn.package) {
    // Checks in the article in a package
    db.beginTransaction()
      .then(() => {
        // Gets name of shelf, storageroom and branch, and id of storageroom.
        const p1 = db.query('SELECT sh.shelf_name, st.name AS StorageRoomName, co.current_storage_room, br.name AS BranchName FROM Shelf sh INNER JOIN Container co ON sh.id IN (SELECT shelf FROM Package WHERE id = co.id) INNER JOIN StorageRoom st ON co.current_storage_room = st.id INNER JOIN Branch br ON st.branch = br.id WHERE co.id = ? ', [checkIn.package]);
        return Promise.all([p1]);
      })
      .then((p1) => {
        selectresults = p1[0];
        // checks so that the storageroom where the package is is the same as the one where the check-in is done
        if (selectresults[0].current_storage_room != checkIn.storage_room) {
          throw new Error('Wrong storage room');
        } else {
          // Inserts the correct container into the storagemap
          db.query(
            'UPDATE StorageMap SET container = ? WHERE article = (SELECT id FROM Article WHERE material_number = ?)',
            [
              checkIn.package,
              checkIn.material_number,
            ],
          );
        }
      })
      .then(() => {
        // Createa storageevent for the article
        db.query(
          'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article, branch) VALUES ("checked_in", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?, (SELECT package_number FROM Package WHERE id = ?),?, ?,(SELECT id FROM Article WHERE material_number = ?),?)',
          [
            checkIn.comment,
            checkIn.package,
            selectresults[0].shelf_name,
            selectresults[0].StorageRoomName,
            checkIn.material_number,
            selectresults[0].BranchName,
          ],
        );
      })
      // Gets the created storage event and returns it to the user
      .then(() => db.query('SELECT * FROM StorageEvent ORDER BY id DESC LIMIT 0, 1'))
      .then((eventResult) => Promise.all(eventResult, db.commit()))
      .then(([eventResult]) => {
        db.close();
        response.send(eventResult);
      })
      .catch((err) => {
        console.log(err);
        db.rollback();
        db.close();
        response.status(400).json({ error: err.message });
      });

    // End of if checkIn.package statament
  } else if (checkIn.shelf) {
    // Checks in the article to a Shelf, without a package

    db.beginTransaction()
      .then(() => {
        // Gets information for checking that the check-in is made in the right storageroom, also gets information to put in the storageevent
        const p1 = db.query('SELECT sh.shelf_name, st.name AS StorageRoomName, co.current_storage_room, br.name AS BranchName FROM Shelf sh INNER JOIN Container co ON sh.id = co.id INNER JOIN StorageRoom st ON co.current_storage_room = st.id INNER JOIN Branch br ON st.branch = br.id WHERE co.id = ? ', [checkIn.shelf]);
        return Promise.all([p1]);
      })
      .then((p1) => {
        selectresults = p1[0];
        // checks so that the storageroom where the shelf is is the same as the one where the check-in is done
        if (selectresults[0].current_storage_room != checkIn.storage_room) {
          throw new Error('Wrong storage room');
        } else {
          // Inserts the correct container into the storagemap
          db.query(
            'UPDATE StorageMap SET container = ? WHERE article = (SELECT id FROM Article WHERE material_number = ?)',
            [
              checkIn.shelf,
              checkIn.material_number,
            ],
          );
        }
      })
      .then(() => {
        // Createa storageevent for the article
        db.query(
          'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article, branch) VALUES ("checked_in", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?, NULL,?, ?,(SELECT id FROM Article WHERE material_number = ?),?)',
          [
            checkIn.comment,
            selectresults[0].shelf_name,
            selectresults[0].StorageRoomName,
            checkIn.material_number,
            selectresults[0].BranchName,
          ],
        );
      })
      // Gets the created storage event and returns it to the user
      .then(() => db.query('SELECT * FROM StorageEvent ORDER BY id DESC LIMIT 0, 1'))
      .then((eventResult) => Promise.all(eventResult, db.commit()))
      .then(([eventResult]) => {
        db.close();
        response.send(eventResult);
      })
      .catch((err) => {
        console.log(err);
        db.rollback();
        db.close();
        response.status(400).json({ error: err.message });
      });
  }
});
// Registers an article
router.post('/register', async (request, response) => {
  const db = await makeDb();
  const regInfo = {
    shelf: request.body.shelf,
    package: request.body.package,
    comment: request.body.comment,
    storage_room: request.body.storage_room,
    material_number: request.body.material_number,
    description: request.body.description,
    reference_number: request.body.material_number.split('-')[0],
  };
  let selectresults;

  // checks so that storage_room, material_number and either package or shelf is provided. Package and shelf are tried with the logic of a xor gate.
  if (!regInfo.storage_room || !regInfo.material_number || !(!(regInfo.package && regInfo.shelf) && (regInfo.package || regInfo.shelf))) {
    response.status(400).send('Bad request');
  } else if (regInfo.package) {
    // Checks in the article in a package
    db.beginTransaction()
      .then(() => {
        // Create case if not exists
        db.query('INSERT INTO `Case` (reference_number) SELECT ? WHERE NOT EXISTS (SELECT * FROM `Case` WHERE reference_number= ?)',
          [regInfo.reference_number, regInfo.reference_number]);
      })
      .then(() => {
        // Checks if article already exists, then throws error
        const alreadyExists = db.query('SELECT * FROM Article WHERE material_number = ?', [regInfo.material_number]);
        return Promise.all([alreadyExists]);
      })
      .then((alreadyExists) => {
        // Creates the article
        if (alreadyExists[0][0]) {
          throw new Error(`Article with material_number ${regInfo.material_number} already exists`);
        } else {
          db.query('INSERT INTO Article (material_number, description, `case`) VALUES (?, ?, (SELECT id FROM `Case` WHERE reference_number = ?))',
            [regInfo.material_number, regInfo.description, regInfo.reference_number]);
        }
      })
      .then(() => {
        // Gets name of shelf, storageroom and branch, and id of storageroom.
        const p1 = db.query('SELECT sh.shelf_name, st.name AS StorageRoomName, co.current_storage_room, br.name AS BranchName FROM Shelf sh INNER JOIN Container co ON sh.id IN (SELECT shelf FROM Package WHERE id = co.id) INNER JOIN StorageRoom st ON co.current_storage_room = st.id INNER JOIN Branch br ON st.branch = br.id WHERE co.id = ? ', [regInfo.package]);
        return Promise.all([p1]);
      })
      .then((p1) => {
        selectresults = p1[0];
        // checks so that the storageroom where the package is is the same as the one where the register is done
        if (selectresults[0].current_storage_room != regInfo.storage_room) {
          throw new Error('Wrong storage room');
        } else {
          // Creates the storagemap for the article
          db.query(
            'INSERT INTO StorageMap (article, container) VALUES ((SELECT id FROM Article WHERE material_number = ?), ?)',
            [
              regInfo.material_number,
              regInfo.package,
            ],
          );
        }
      })
      .then(() => {
        // Createa storageevent for the article
        db.query(
          'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article, branch) VALUES ("checked_in", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?, (SELECT package_number FROM Package WHERE id = ?),?, ?,(SELECT id FROM Article WHERE material_number = ?),?)',
          [
            regInfo.comment,
            regInfo.package,
            selectresults[0].shelf_name,
            selectresults[0].StorageRoomName,
            regInfo.material_number,
            selectresults[0].BranchName,
          ],
        );
      })
      // Gets the created storage event and returns it to the user
      .then(() => db.query('SELECT * FROM StorageEvent ORDER BY id DESC LIMIT 0, 1'))
      .then((eventResult) => Promise.all(eventResult, db.commit()))
      .then(([eventResult]) => {
        db.close();
        response.send(eventResult);
      })
      .catch((err) => {
        console.log(err);
        db.rollback();
        db.close();
        response.status(400).json({ error: err.message });
      });
    // End of if regInfo.package statament
  } else if (regInfo.shelf) {
    // Registers the article to a Shelf, without a package
    db.beginTransaction()
      .then(() => {
        // Create case if not exists
        db.query('INSERT INTO `Case` (reference_number) SELECT ? WHERE NOT EXISTS (SELECT * FROM `Case` WHERE reference_number= ?)',
          [regInfo.reference_number, regInfo.reference_number]);
      })
      .then(() => {
        // Checks if article already exists, then throws error
        const alreadyExists = db.query('SELECT * FROM Article WHERE material_number = ?', [regInfo.material_number]);
        return Promise.all([alreadyExists]);
      })
      .then((alreadyExists) => {
        if (alreadyExists[0][0]) {
          throw new Error('Article with given material_number already exists');
        } else {
          // Creates the article
          db.query('INSERT INTO Article (material_number, description, `case`) VALUES (?, ?, (SELECT id FROM `Case` WHERE reference_number = ?))',
            [regInfo.material_number, regInfo.description, regInfo.reference_number]);
        }
      })
      .then(() => {
        // Gets information for checking that the check-in is made in the right storageroom, also gets information to put in the storageevent
        const p1 = db.query('SELECT sh.shelf_name, st.name AS StorageRoomName, co.current_storage_room, br.name AS BranchName FROM Shelf sh INNER JOIN Container co ON sh.id = co.id INNER JOIN StorageRoom st ON co.current_storage_room = st.id INNER JOIN Branch br ON st.branch = br.id WHERE co.id = ? ', [regInfo.shelf]);
        return Promise.all([p1]);
      })
      .then((p1) => {
        selectresults = p1[0];
        // checks so that the storageroom where the shelf is is the same as the one where the check-in is done
        if (selectresults[0].current_storage_room != regInfo.storage_room) {
          throw new Error('Wrong storage room');
        } else {
          // Inserts the correct container into the storagemap
          db.query(
            'INSERT INTO StorageMap (article, container) VALUES ((SELECT id FROM Article WHERE material_number = ?), ?)',
            [
              regInfo.material_number,
              regInfo.shelf,
            ],
          );
        }
      })
      .then(() => {
        // Createa storageevent for the article
        db.query(
          'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article, branch) VALUES ("checked_in", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?, NULL,?, ?,(SELECT id FROM Article WHERE material_number = ?),?)',
          [
            regInfo.comment,
            selectresults[0].shelf_name,
            selectresults[0].StorageRoomName,
            regInfo.material_number,
            selectresults[0].BranchName,
          ],
        );
      })
      // Gets the created storage event and returns it to the user
      .then(() => db.query('SELECT * FROM StorageEvent ORDER BY id DESC LIMIT 0, 1'))
      .then((eventResult) => Promise.all(eventResult, db.commit()))
      .then(([eventResult]) => {
        db.close();
        response.send(eventResult);
      })
      .catch((err) => {
        console.log(err);
        db.rollback();
        db.close();
        response.status(400).json({ error: err.message });
      });
  }
});

// Change the description of an article
router.put('/:id', async (request, response) => {
  const db = await makeDb();
  const { id } = request.params;
  const desc = request.body.description;

  db.beginTransaction()
    .then(() => db.query('UPDATE Article SET description = ? WHERE id = ?', [desc, id]))
    .then(() => db.query('SELECT ar.id, ar.description, ar.material_number, ca.reference_number FROM Article ar INNER JOIN `Case` ca ON ar.`case` = ca.id WHERE ar.id = ?', [id]))
    .then((modifiedArticle) => Promise.all(modifiedArticle, db.commit()))
    .then(([modifiedArticle]) => {
      db.close();
      response.send(modifiedArticle);
    })
    .catch((err) => {
      console.log(err);
      db.rollback();
      db.close();
      response.status(400).json({ error: err.message });
    });
});
// Incorporates an article
router.post('/incorporate', async (request, response) => {
  const db = await makeDb();
  const incorp = {
    shelf: request.body.shelf,
    package: request.body.package,
    comment: request.body.comment,
    storage_room: request.body.storage_room,
    material_number: request.body.material_number,
  };
  let selectresults;

  // checks so that storage_room, material_number and either package or shelf is provided. Package and shelf are tried with the logic of a xor gate.
  if (!incorp.storage_room || !incorp.material_number || !(!(incorp.package && incorp.shelf) && (incorp.package || incorp.shelf))) {
    response.status(400).send('Bad request');
  } else if (incorp.package) {
    // Incorporates the article in a package
    db.beginTransaction()
      .then(() => {
        // Gets name of shelf, storageroom and branch, and id of storageroom.
        const p1 = db.query('SELECT sh.shelf_name, st.name AS StorageRoomName, co.current_storage_room, br.name AS BranchName FROM Shelf sh INNER JOIN Container co ON sh.id IN (SELECT shelf FROM Package WHERE id = co.id) INNER JOIN StorageRoom st ON co.current_storage_room = st.id INNER JOIN Branch br ON st.branch = br.id WHERE co.id = ? ', [incorp.package]);
        return Promise.all([p1]);
      })
      .then((p1) => {
        selectresults = p1[0];
        // checks so that the storageroom where the package is is the same as the one where the incorporation is done
        if (selectresults[0].current_storage_room != incorp.storage_room) {
          throw new Error('Wrong storage room');
        } else {
          // Inserts the correct container into the storagemap
          const update = db.query(
            'UPDATE StorageMap SET container = ? WHERE article = (SELECT id FROM Article WHERE material_number = ?)',
            [
              incorp.package,
              incorp.material_number,
            ],
          );
          return Promise.all([update]);
        }
      })
      .then((update) => {
        // Createa storageevent for the article
        if (!update[0].affectedRows) {
          throw new Error('Article does not exist');
        } else {
          db.query(
            'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article, branch) VALUES ("incorporated", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?, (SELECT package_number FROM Package WHERE id = ?),?, ?,(SELECT id FROM Article WHERE material_number = ?),?)',
            [
              incorp.comment,
              incorp.package,
              selectresults[0].shelf_name,
              selectresults[0].StorageRoomName,
              incorp.material_number,
              selectresults[0].BranchName,
            ],
          );
        }
      })
      // Gets the created storage event and returns it to the user
      .then(() => db.query('SELECT * FROM StorageEvent ORDER BY id DESC LIMIT 0, 1'))
      .then((eventResult) => Promise.all(eventResult, db.commit()))
      .then(([eventResult]) => {
        db.close();
        response.send(eventResult);
      })
      .catch((err) => {
        console.log(err);
        db.rollback();
        db.close();
        response.status(400).json({ error: err.message });
      });

    // End of if incorp.package statament
  } else if (incorp.shelf) {
    // Incorporates the article to a Shelf, without a package

    db.beginTransaction()
      .then(() => {
        // Gets information for checking that the incorporation is made in the right storageroom, also gets information to put in the storageevent
        const p1 = db.query('SELECT sh.shelf_name, st.name AS StorageRoomName, co.current_storage_room, br.name AS BranchName FROM Shelf sh INNER JOIN Container co ON sh.id = co.id INNER JOIN StorageRoom st ON co.current_storage_room = st.id INNER JOIN Branch br ON st.branch = br.id WHERE co.id = ? ', [incorp.shelf]);
        return Promise.all([p1]);
      })
      .then((p1) => {
        selectresults = p1[0];
        // checks so that the storageroom where the shelf is is the same as the one where the incorporation is done
        if (selectresults[0].current_storage_room != incorp.storage_room) {
          throw new Error('Wrong storage room');
        } else {
          // Inserts the correct container into the storagemap
          const update = db.query(
            'UPDATE StorageMap SET container = ? WHERE article = (SELECT id FROM Article WHERE material_number = ?)',
            [
              incorp.shelf,
              incorp.material_number,
            ],
          );
          return Promise.all([update]);
        }
      })
      .then((update) => {
        if (!update[0].affectedRows) {
          throw new Error('Article does not exist');
        } else {
          // Createa storageevent for the article
          db.query(
            'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article, branch) VALUES ("incorporated", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?, NULL,?, ?,(SELECT id FROM Article WHERE material_number = ?),?)',
            [
              incorp.comment,
              selectresults[0].shelf_name,
              selectresults[0].StorageRoomName,
              incorp.material_number,
              selectresults[0].BranchName,
            ],
          );
        }
      })
      // Gets the created storage event and returns it to the user
      .then(() => db.query('SELECT * FROM StorageEvent ORDER BY id DESC LIMIT 0, 1'))
      .then((eventResult) => Promise.all(eventResult, db.commit()))
      .then(([eventResult]) => {
        db.close();
        response.send(eventResult);
      })
      .catch((err) => {
        console.log(err);
        db.rollback();
        db.close();
        response.status(400).json({ error: err.message });
      });
  }
});
// Gets an article given its material_number
router.get('/material_number/:material_number', (request, response) => {
  const { material_number } = request.params;
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'SELECT * FROM Article_information WHERE material_number = ?';
      connection.query(sql, [material_number], (err, result) => {
        connection.release();
        if (err) {
          console.log(err);
          response.status(400).json({ error: err.message });
        } else if (result.length) {
          console.log('Data received');
          response.send(result[0]);
        } else {
          response.status(400).json({ error: `No article with material_number ${material_number}` });
        }
      });
    }
  });
});

module.exports = router;
