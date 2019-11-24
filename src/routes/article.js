/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-const-assign */
/* eslint-disable camelcase */
/* eslint-disable no-shadow */
const express = require('express');
const util = require('util');

const router = express.Router();

// Example: Establishing a connection and query to db
const pool = require('../util/connect');

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

// Return all articles in DB
router.get('/', (req, res) => {
  // eslint-disable-next-line func-names
  pool.getConnection((err, connection) => {
    let sql_query = "select Article.material_number, Case.reference_number, Branch.name as 'branch', StorageRoom.name as 'storage_room',";
    sql_query
      += ' CASE WHEN EXISTS (select package_number from Package where id  = (select container from StorageMap where article = Article.id))';
    sql_query
      += " THEN (select package_number from Package where id  = (select container from StorageMap where article = Article.id)) ELSE ' - ' END as package,";
    sql_query
      += " Shelf.shelf_name as 'shelf', se2.action as 'status',se1.timestamp as 'timestamp', se2.timestamp as 'last modified', Article.description";
    sql_query
      += ' FROM Article, `Case`, Branch, StorageRoom, Shelf, StorageEvent as se1, StorageEvent as se2';
    sql_query += ' WHERE Article.case = Case.id';
    sql_query
      += ' and (StorageRoom.id = (select current_storage_room from Container where id = (select container from StorageMap where article = Article.id)))';
    sql_query
      += ' and (Shelf.id = (select container from StorageMap where article = Article.id) OR Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = Article.id)))';
    sql_query
      += ' AND se1.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp ASC LIMIT 1)';
    sql_query
      += ' AND se2.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp DESC LIMIT 1)';
    sql_query += ' and Branch.id = StorageRoom.branch';
    sql_query += ' ORDER BY Article.material_number asc';

    if (err) console.log(err);
    connection.query(sql_query, (err, result) => {
      connection.release();
      if (err) throw err;
      console.log(res);
      res.send(result);
    });
  });
});

// Return single article
router.get('/:id', (req, res) => {
  const { id } = req.params;
  pool.getConnection((err, connection) => {
    if (err) console.log(err);

    let sql_query = "select Article.material_number, Case.reference_number, Branch.name as 'branch', StorageRoom.name as 'storage_room',";
    sql_query
      += ' CASE WHEN EXISTS (select package_number from Package where id  = (select container from StorageMap where article = Article.id))';
    sql_query
      += " THEN (select package_number from Package where id  = (select container from StorageMap where article = Article.id)) ELSE ' - ' END as package,";
    sql_query
      += " Shelf.shelf_name as 'shelf', se2.action as 'status',se1.timestamp as 'timestamp', se2.timestamp as 'last modified', Article.description";
    sql_query
      += ' FROM Article, `Case`, Branch,  StorageRoom, Shelf, StorageEvent as se1, StorageEvent as se2';
    sql_query += ' WHERE Article.case = Case.id';
    sql_query
      += ' and (StorageRoom.id = (select current_storage_room from Container where id = (select container from StorageMap where article = Article.id)))';
    sql_query
      += ' and (Shelf.id = (select container from StorageMap where article = Article.id) OR Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = Article.id)))';
    sql_query
      += ' AND se1.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp ASC LIMIT 1)';
    sql_query
      += ' AND se2.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp DESC LIMIT 1)';
    sql_query += ' AND Article.id = ?';
    sql_query += ' and Branch.id = StorageRoom.branch';
    sql_query += ' ORDER BY Article.material_number asc';

    connection.query(sql_query, [id], (err, result) => {
      connection.release();
      if (err) throw err;
      console.log(res);
      console.log(sql_query);
      res.send(result);
    });
  });
});

// Return all articles for a specific case
router.get('/case/:id', (req, res) => {
  const { id } = req.params;
  // eslint-disable-next-line consistent-return
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Could not connect to server');
    }
    let sql_query = "select distinct Article.material_number, Case.reference_number, Branch.name as 'branch', StorageRoom.name as 'storage_room',";
    sql_query
      += ' CASE WHEN EXISTS (select package_number from Package where id  = (select container from StorageMap where article = Article.id))';
    sql_query
      += " THEN (select package_number from Package where id  = (select container from StorageMap where article = Article.id)) ELSE ' - ' END as package,";
    sql_query
      += " Shelf.shelf_name as 'shelf', se2.action as 'status',se1.timestamp as 'timestamp', se2.timestamp as 'last modified', Article.description";
    sql_query
      += ' FROM Article, `Case`, Branch, StorageRoom, Shelf, Package, Container, StorageEvent as se1, StorageEvent as se2';
    sql_query += ' WHERE Article.case = Case.id';
    sql_query
      += ' and (StorageRoom.id = (select current_storage_room from Container where id = (select container from StorageMap where article = Article.id)))';
    sql_query
      += ' and (Shelf.id = (select container from StorageMap where article = Article.id) OR Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = Article.id)))';
    sql_query
      += ' AND se1.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp ASC LIMIT 1)';
    sql_query
      += ' AND se2.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp DESC LIMIT 1)';
    sql_query += ' and Branch.id = StorageRoom.branch';
    sql_query += ' and Case.id = ?';
    sql_query += ' ORDER BY Article.material_number asc';

    if (err) console.log(err);
    connection.query(sql_query, [id], (err, result) => {
      connection.release();
      if (err) throw err;
      console.log(res);
      console.log(sql_query);
      res.send(result);
    });
  });
});

// Return all articles currently in a specific storage room
router.get('/storageroom/:id', (req, res) => {
  const { id } = req.params;
  // eslint-disable-next-line func-names
  // eslint-disable-next-line consistent-return
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Could not connect to server');
    }
    let sql_query = "select distinct Article.material_number, Case.reference_number, Branch.name as 'branch', StorageRoom.name as 'storage_room',";
    sql_query
      += ' CASE WHEN EXISTS (select package_number from Package where id  = (select container from StorageMap where article = Article.id))';
    sql_query
      += " THEN (select package_number from Package where id  = (select container from StorageMap where article = Article.id)) ELSE ' - ' END as package,";
    sql_query
      += " Shelf.shelf_name as 'shelf', se2.action as 'status',se1.timestamp as 'timestamp', se2.timestamp as 'last modified', Article.description";
    sql_query
      += ' FROM Article, `Case`, Branch, StorageRoom, Shelf, Package, Container, StorageEvent as se1, StorageEvent as se2';
    sql_query += ' WHERE Article.case = Case.id';
    sql_query += ' and StorageRoom.id = ?';
    sql_query
      += ' and (StorageRoom.id = (select current_storage_room from Container where id = (select container from StorageMap where article = Article.id)))';
    sql_query
      += ' and (Shelf.id = (select container from StorageMap where article = Article.id) OR Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = Article.id)))';
    sql_query
      += ' AND se1.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp ASC LIMIT 1)';
    sql_query
      += ' AND se2.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp DESC LIMIT 1)';
    sql_query += ' and Branch.id = StorageRoom.branch';
    sql_query += ' ORDER BY Article.material_number asc';

    if (err) console.log(err);
    connection.query(sql_query, [id], (err, result) => {
      connection.release();
      if (err) throw err;
      console.log(res);
      console.log(sql_query);
      res.send(result);
    });
  });
});

// Return all articles in a specific package
router.get('/package/:id', (req, res) => {
  const { id } = req.params;
  // eslint-disable-next-line func-names
  // eslint-disable-next-line consistent-return
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Could not connect to server');
    }
    let sql_query = "select distinct Article.material_number, Case.reference_number, Branch.name as 'branch', StorageRoom.name as 'storage_room',";
    sql_query
      += ' CASE WHEN EXISTS (select package_number from Package where id  = (select container from StorageMap where article = Article.id))';
    sql_query
      += " THEN (select package_number from Package where id  = (select container from StorageMap where article = Article.id)) ELSE ' - ' END as package,";
    sql_query
      += " Shelf.shelf_name as 'shelf', se2.action as 'status',se1.timestamp as 'timestamp', se2.timestamp as 'last modified', Article.description";
    sql_query
      += ' FROM Article, `Case`, Branch, StorageRoom, Shelf, Package, Container, StorageEvent as se1, StorageEvent as se2';
    sql_query += ' WHERE Article.case = Case.id';
    sql_query
      += ' and (StorageRoom.id = (select current_storage_room from Container where id = (select container from StorageMap where article = Article.id)))';
    sql_query
      += ' and (Shelf.id = (select container from StorageMap where article = Article.id) OR Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = Article.id)))';
    sql_query
      += ' AND se1.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp ASC LIMIT 1)';
    sql_query
      += ' AND se2.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp DESC LIMIT 1)';
    sql_query += ' and Branch.id = StorageRoom.branch';
    sql_query += ' and Package.id = ?';
    sql_query
      += ' AND Package.id = (select id from Container where Container.id = (select container from StorageMap where article = Article.id))';
    sql_query += ' ORDER BY Article.material_number asc';

    if (err) console.log(err);
    connection.query(sql_query, [id], (err, result) => {
      connection.release();
      if (err) throw err;
      console.log(res);
      console.log(sql_query);
      res.send(result);
    });
  });
});

// gets all articles belonging to a specific branch
router.get('/branch/:branch_id', (request, response) => {
  const branchid = request.params.branch_id;
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'SELECT * FROM Article  WHERE id IN (SELECT article FROM StorageMap WHERE container IN (SELECT id FROM Container WHERE current_storage_room IN (SELECT id FROM StorageRoom WHERE branch = ?)))';
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
router.post('/check-in', (request, response) => {
  const checkIn = {
    shelf: request.body.shelf,
    package: request.body.package,
    comment: request.body.comment,
    storage_room: request.body.storage_room,
    material_number: request.body.material_number,
  };

  // checks so that storage_room, material_number and either package or shelf is provided. Package and shelf are tried with the logic of a xor gate.
  if (!checkIn.storage_room || !checkIn.material_number || !(!(checkIn.package && checkIn.shelf) && (checkIn.package || checkIn.shelf))) {
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
          } else if (checkIn.package) {
            // Checks in the article in a package
            // Gets name of shelf, storageroom and branch, and id of storageroom.
            let sql = 'SELECT sh.shelf_name, st.name AS StorageRoomName, co.current_storage_room, br.name AS BranchName FROM Shelf sh INNER JOIN Container co ON sh.id IN (SELECT shelf FROM Package WHERE id = co.id) INNER JOIN StorageRoom st ON co.current_storage_room = st.id INNER JOIN Branch br ON st.branch = br.id WHERE co.id = ? ';
            connection.query(sql, [checkIn.package], function (err1, result1) {
              if (err1) {
                connection.rollback(function () {
                  console.log(err1);
                  response.status(400).send('Bad query');
                });
                // checks so that the storageroom where the package is is the same as the one where the check-in is done
              } else if (result1[0].current_storage_room == checkIn.storage_room) {
                // Inserts the correct container into the storagemap
                sql = 'UPDATE StorageMap SET container = ? WHERE article = (SELECT id FROM Article WHERE material_number = ?)';

                connection.query(
                  sql,
                  [
                    checkIn.package,
                    checkIn.material_number,
                  ],
                  function (err2, result2) {
                    if (err2) {
                      connection.rollback(function () {
                        console.log(err2);
                        response.status(400).send('Bad query');
                      });
                    } else {
                      // Createa storageevent for the article


                      sql = 'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article, branch) VALUES ("checked_in", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?, (SELECT package_number FROM Package WHERE id = ?),?, ?,(SELECT id FROM Article WHERE material_number = ?),?)';

                      connection.query(
                        sql,
                        [
                          checkIn.comment,
                          checkIn.package,
                          result1[0].shelf_name,
                          result1[0].StorageRoomName,
                          checkIn.material_number,
                          result1[0].BranchName,
                        ],
                        function (err3, result3) {
                          if (err3) {
                            connection.rollback(function () {
                              console.log(err3);
                              response.status(400).send('Bad query');
                            });
                          } else {

                            // Gets the created storage event and returns it to the user
                            sql = 'SELECT * FROM StorageEvent ORDER BY id DESC LIMIT 0, 1';
                            connection.query(sql, (err5, result4) => {

                              if (err5) {
                                connection.rollback(function () {
                                  console.log(err5);
                                  response.status(400).send('Bad query');
                                });
                              } else {

                                connection.commit(function (err4) {
                                  if (err4) {
                                    connection.rollback(function () {
                                      console.log(err4);
                                    });
                                  } else {
                                    console.log('Transaction Complete.');
                                    connection.end();
                                    response.send(result4);
                                  }
                                });

                              }
                            });

                          }
                        },
                      );


                    }


                  });

              } else {
                response.send("Bad query");
              }
            });
            // End of if checkIn.package statament
          } else if (checkIn.shelf) {
            // Checks in the article to a Shelf, without a package
            // Gets information for checking that the check-in is made in the right storageroom, also gets information to put in the storageevent
            let sql = 'SELECT sh.shelf_name, st.name AS StorageRoomName, co.current_storage_room, br.name AS BranchName FROM Shelf sh INNER JOIN Container co ON sh.id = co.id INNER JOIN StorageRoom st ON co.current_storage_room = st.id INNER JOIN Branch br ON st.branch = br.id WHERE co.id = ? ';
            connection.query(sql, [checkIn.shelf], function (err1, result1) {
              if (err1) {
                connection.rollback(function () {
                  console.log(err1);
                  response.status(400).send('Bad query');
                });
                // checks so that the storageroom where the shelf is is the same as the one where the check-in is done
              } else if (result1[0].current_storage_room == checkIn.storage_room) {
                // Inserts the correct container into the storagemap
                sql = 'UPDATE StorageMap SET container = ? WHERE article = (SELECT id FROM Article WHERE material_number = ?)';

                connection.query(
                  sql,
                  [
                    checkIn.shelf,
                    checkIn.material_number,
                  ],
                  function (err2, result2) {
                    if (err2) {
                      connection.rollback(function () {
                        console.log(err2);
                        response.status(400).send('Bad query');
                      });
                    } else {
                      // Create a storageevent for the article


                      sql = 'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article, branch) VALUES ("checked_in", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?, NULL,?, ?,(SELECT id FROM Article WHERE material_number = ?),?)';

                      connection.query(
                        sql,
                        [
                          checkIn.comment,

                          result1[0].shelf_name,
                          result1[0].StorageRoomName,
                          checkIn.material_number,
                          result1[0].BranchName,
                        ],
                        function (err3, result3) {
                          if (err3) {
                            connection.rollback(function () {
                              console.log(err3);
                              response.status(400).send('Bad query');
                            });
                          } else {

                            // Gets the created storage event and sends it to the user
                            sql = 'SELECT * FROM StorageEvent ORDER BY id DESC LIMIT 0, 1';
                            connection.query(sql, (err5, result4) => {

                              if (err5) {
                                connection.rollback(function () {
                                  console.log(err5);
                                  response.status(400).send('Bad query');
                                });
                              } else {

                                connection.commit(function (err4) {
                                  if (err4) {
                                    connection.rollback(function () {
                                      console.log(err4);
                                    });
                                  } else {
                                    console.log('Transaction Complete.');
                                    connection.end();
                                    response.send(result4);
                                  }
                                });

                              }
                            });

                          }
                        },
                      );


                    }


                  });

              } else {
                response.send("Bad query");
              }
            });
            // End on if checkIn.shelf statement
          }
        });
      }

    });
  }
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
        response.send(400);
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
        response.send(400);
      });
  }
});

module.exports = router;
