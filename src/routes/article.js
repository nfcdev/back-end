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
/* router.get('/', (req, res) => {
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
}); */

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


///EGET GET FÖR TESTNING


// Return all articles in DB
router.get('/', (req, res) => {
  // eslint-disable-next-line func-names
  pool.getConnection((err, connection) => {
    let sql_query = 'SELECT * FROM Article';

    if (err) console.log(err);
    connection.query(sql_query, (err, result) => {
      connection.release();
      if (err) throw err;
      console.log(res);
      res.send(result);
    });
  });
});


//creates and checks in a new article. Returns storage event
router.post('/register', (req, res) => {
  const artRegister = {
    material_number: req.body.material_number,
    reference_number: req.body.material_number.split("-")[0],
    description: req.body.description,
    comment: req.body.comment,
    storage_room: req.body.storage_room,
    shelf: req.body.shelf,
    package: req.body.package

  };

  if (
    !artRegister.material_number
    || !artRegister.storage_room
    || (!artRegister.shelf && !artRegister.package)
    || (artRegister.shelf && artRegister.package)
  ) {
    res.status(400).send('Bad request');
  } else {

   

    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Could not connect to server');
      }

     

      const article = [
        artRegister.material_number,
        artRegister.description, 
        artRegister.reference_number
      ];
      console.log(artRegister.reference_number);
      const sql2 ='SELECT COUNT(1) AS count FROM `Case` WHERE reference_number = ?';
      let createCase;

      connection.query(sql2, artRegister.reference_number, (err, result) => {
        console.log("loggar result av nya grejen");
        createCase = (result[0].count);
        console.log(createCase);
        //connection.release();
        if (err) {
          console.log(err);
          return res.status(400).send('Bad query1');
        };
      });


      //const sql = 'INSERT INTO Article(`material_number`, `description`, `case`) VALUES (?, ?, (SELECT id FROM `Case` WHERE reference_number = ?))';     
      if (createCase == 0) {

        const sql = 'INSERT INTO `Case` (`reference_number`) VALUES (?)';
      connection.query(sql, artRegister.reference_number, (err, result) => {
        if (err) {
          console.log(err);
          return res.status(400).send('Bad query1.1');
        };
      });

        
      } 
     
    
      //connection.query(sql, artRegister.material_number, artRegister.description, , (err, result) => { 
      console.log("loggar artregister.reference_number: " + artRegister.reference_number);
      const sql = 'INSERT INTO Article(`material_number`, `description`, `case`) VALUES (?, ?, (SELECT id FROM `Case` WHERE reference_number = ?))';  
      connection.query(sql, article, (err, result) => {
        console.log(result);
        //connection.release();
        if (err) {
          console.log(err);
          return res.status(400).send('Bad query1');
          
        }

        //////////////


        if (artRegister.package) {
          // Checks in the article in a package
          // Gets name of shelf, storageroom and branch, and id of storageroom.

        // let sql = 'SELECT sh.shelf_name, st.name AS StorageRoomName, co.current_storage_room, br.name AS BranchName FROM Shelf AS sh, StorageRoom AS st, Container AS co, Branch AS br INNER JOIN co ON sh.id IN (SELECT shelf FROM Package WHERE id = co.id) INNER JOIN st ON co.current_storage_room = st.id INNER JOIN br ON st.branch = br.id WHERE co.id = ? ';
        //  let sql = 'SELECT shelf_name, StorageRoom.name AS StorageRoomName, Container.current_storage_room, Branch.name AS BranchName FROM Shelf INNER JOIN Container ON sh.id IN (SELECT shelf FROM Package WHERE id = co.id) INNER JOIN StorageRoom st ON co.current_storage_room = st.id INNER JOIN Branch br ON st.branch = br.id WHERE co.id = ? ';
         let sql = 'SELECT sh.shelf_name, sr.name, co.current_storage_room, br.name FROM Shelf INNER JOIN StorageRoom ON Container.current_storage_room = StorageRoom.id INNER JOIN Container ON Shelf.id IN (SELECT shelf FROM Package WHERE id = Container.id) INNER JOIN Branch on StorageRoom.branch = Branch.id WHERE Container.id = ?';
          connection.query(sql, [artRegister.package], function (err1, result1) {
            

            console.log("aksndoasndasod PRINT2");
            console.log(result1[0].current_storage_room);
            if (err1) {
              connection.rollback(function () {
                console.log(err1);
                res.status(400).send('Bad query2');
              });
              // checks so that the storageroom where the package is is the same as the one where the check-in is done

            } else if (result1[0].current_storage_room == artRegister.storage_room) {
              // Inserts the correct container into the storagemap
              sql = 'UPDATE StorageMap SET container = ? WHERE article = (SELECT id FROM Article WHERE material_number = ?)';

              connection.query(
                sql,
                [
                  artRegister.package,
                  artRegister.material_number,
                ],
                function (err2, result2) {
                  if (err2) {
                    connection.rollback(function () {
                      console.log(err2);
                      res.status(400).send('Bad query3');
                    });
                  } else {
                    // Createa storageevent for the article


                    sql = 'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article, branch) VALUES ("checked_in", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?, (SELECT package_number FROM Package WHERE id = ?),?, ?,(SELECT id FROM Article WHERE material_number = ?),?)';
                    

                    connection.query(
                      sql,
                      [
                        artRegister.comment,
                        artRegister.package,
                        result1[0].shelf_name,
                        result1[0].StorageRoomName,
                        artRegister.material_number,
                        result1[0].BranchName,
                      ],
                      function (err3, result3) {
                        if (err3) {
                          connection.rollback(function () {
                            console.log(err3);
                            res.status(400).send('Bad query4');
                          });
                        } else {

                          // Gets the created storage event and returns it to the user
                          sql = 'SELECT * FROM StorageEvent ORDER BY id DESC LIMIT 0, 1';
                          connection.query(sql, (err5, result4) => {

                            if (err5) {
                              connection.rollback(function () {
                                console.log(err5);
                                res.status(400).send('Bad query5');
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
                                  res.send(result4);
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
              res.send("Bad query6");
            }
          });
          // End of if checkIn.package statament
        } else if (artRegister.shelf) {
          // Checks in the article to a Shelf, without a package
          // Gets information for checking that the check-in is made in the right storageroom, also gets information to put in the storageevent
          let sql = 'SELECT sh.shelf_name, st.name AS StorageRoomName, co.current_storage_room, br.name AS BranchName FROM Shelf sh INNER JOIN Container co ON sh.id = co.id INNER JOIN StorageRoom st ON co.current_storage_room = st.id INNER JOIN Branch br ON st.branch = br.id WHERE co.id = ? ';
          
          connection.query(sql, [artRegister.shelf], function (err1, result1) {
            console.log("printar result från shelf :" + result1[0].current_storage_room);
            if (err1) {
              connection.rollback(function () {
                console.log(err1);
                res.status(400).send('Bad query7');
              });
              // checks so that the storageroom where the shelf is is the same as the one where the check-in is done
              console.log(result1[0]);
            } else if (result1[0].current_storage_room == artRegister.storage_room) {
              // Inserts the correct container into the storagemap
              sql = 'UPDATE StorageMap SET container = ? WHERE article = (SELECT id FROM Article WHERE material_number = ?)';

              connection.query(
                sql,
                [
                  artRegister.shelf,
                  artRegister.material_number,
                ],
                function (err2, result2) {
                  if (err2) {
                    connection.rollback(function () {
                      console.log(err2);
                      res.status(400).send('Bad query8');
                    });
                  } else {
                    // Create a storageevent for the article


                    sql = 'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article, branch) VALUES ("checked_in", (SELECT DATE_FORMAT(NOW(), "%y%m%d%H%i")), 1, ?, NULL,?, ?,(SELECT id FROM Article WHERE material_number = ?),?)';

                    connection.query(
                      sql,
                      [
                        artRegister.comment,

                        result1[0].shelf_name,
                        result1[0].StorageRoomName,
                        artRegister.material_number,
                        result1[0].BranchName,
                      ],
                      function (err3, result3) {
                        if (err3) {
                          connection.rollback(function () {
                            console.log(err3);
                            res.status(400).send('Bad query9');
                          });
                        } else {

                          // Gets the created storage event and sends it to the user
                          sql = 'SELECT * FROM StorageEvent ORDER BY id DESC LIMIT 0, 1';
                          connection.query(sql, (err5, result4) => {

                            if (err5) {
                              connection.rollback(function () {
                                console.log(err5);
                                res.status(400).send('Bad query10');
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
                                  res.send(result4);
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
              res.send("Bad query11");
            }
          });

        }


        ///////////////////
      });
    });
  }

});


module.exports = router;
