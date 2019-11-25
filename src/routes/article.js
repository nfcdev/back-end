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
        response.send(400);
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
        response.send(400);
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
        response.send(400);
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
        response.send(400);
      });
  }
});

// Change the description of an article
router.put('/:id', async (request, response) => {
  const db = await makeDb();
  const id = request.params.id;
  const desc = request.body.description;

  db.beginTransaction()
    .then(() => {
      db.query('UPDATE Article SET description = ? WHERE id = ?', [desc, id]);
    })
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
      response.send(400);
    });
});

module.exports = router;
