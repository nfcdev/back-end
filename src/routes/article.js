/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-const-assign */
/* eslint-disable camelcase */
/* eslint-disable no-shadow */
const express = require('express');

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
  if (!checkIn.storage_room || !checkIn.material_number || (!(checkIn.package && checkIn.shelf) && (checkIn.package || checkIn.shelf))) {
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
                sql = 'UPDATE StorageMap SET container = ?';

                connection.query(
                  sql,
                  [
                    checkIn.package,
                  ],
                  function (err2, result2) {
                    if (err2) {
                      connection.rollback(function () {
                        console.log(err2);
                        response.status(400).send('Bad query');
                      });
                    } else {
                      // Creates Storage events for the articles in the package


                      sql = 'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article, branch) VALUES ("checked_in", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?, (SELECT package_number FROM Package WHERE id = ?),?, ?,(SELECT id FROM Article WHERE material_number = ?),?';

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
                            console.log(result2[a].article + "created");

                          }
                        },
                      );

                      response.json({ resultat: "Ok" });
                    }


                  });

              } else {
                response.send("Package does not exist");
              }
            });

          }
        });
      }
      connection.release();
    });
  }
});

router.get('/hej/event', (request, response) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      response.status(500).send('Cannot conect to server');
    } else {
      const sql = 'SELECT * FROM StorageEvent';
      connection.query(sql, (err, result) => {
        connection.release();
        if (err) {
          console.log(err);
          response.status(400).send('Bad query');
        } else {

          response.send(result);
        }
      });
    }

  });
});

router.get('/hej/:id', (request, response) => {
  const id = request.params.id;
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      response.status(500).send('Cannot conect to server');
    } else {
      let sql = 'SELECT sh.shelf_name, st.name AS StorageRoomName, co.current_storage_room, br.name AS BranchName FROM Shelf sh INNER JOIN Container co ON sh.id IN (SELECT shelf FROM Package WHERE id = co.id) INNER JOIN StorageRoom st ON co.current_storage_room = st.id INNER JOIN Branch br ON st.branch = br.id WHERE co.id = ? ';
      connection.query(sql, [id], (err, result) => {
        connection.release();
        if (err) {
          console.log(err);
          response.status(400).send('Bad query');
        } else {

          response.send(result);
        }
      });
    }
  });
});

module.exports = router;
