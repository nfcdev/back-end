const express = require('express');

const router = express.Router();

// Example: Establishing a connection and query to db
const pool = require('../util/connect');

// Process an article with specific storage-room id
router.post('/process', (req, res) => {
  const processArticle = {
    material_number: req.body.material_number,
    comment: req.body.comment,
    storage_room: req.body.storage_room,
  };
  if (!processArticle.material_number || !processArticle.storage_room) {
    res.status(400).send('Bad request');
  } else {
    // eslint-disable-next-line consistent-return
    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Could not connect to server');
      }

      let sql = 'SELECT CASE WHEN EXISTS ((select * from StorageMap where article = (select id from Article where material_number = ?) and container = (select id from Container where current_storage_room = ?))';
      sql += ' THEN (Delete from Container where current_storage_room = ?)';
      sql = 'select * from StorageMap where article = (select id from Article where material_number = ?) and container = (select id from Container where current_storage_room = ?';

      // sql += ' and Select * from StorageMap';

      // eslint-disable-next-line consistent-return
      connection.query(sql, [processArticle.material_number, processArticle.storage_room, processArticle.storage_room], (err, result) => {
        connection.release();
        if (err) {
          console.log(err);
          return res.status(400).send('Bad query');
        }
        console.log('Article has been processed!');
        console.log(sql);
        res.send(result);
      });
    });
  }
});

// Create a new storage-event
router.post('/???', (req, res) => {
  const storageEvent = {
    action: req.body.action,
    timestamp: req.body.timestamp,
    user: req.body.user,
    comment: req.body.comment,
    package: req.body.package,
    shelf: req.body.shelf,
    storage_room: req.body.storage_room,
    article: req.body.article,
  };

  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Could not connect to server');
    }

    let sql = 'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article)';
    sql += 'VALUES (get_action(?), Select UNIX_TIMESTAMP, get_user_id, get_optional_comment(?),';
    sql += ' Select package from Package where Package.id = (select id from Container where Container.id = (select container from StorageMap where article = (select id from Article where material_number = ?,)))';
    sql += ' Select shelf_name from Shelf where Shelf.id = (select container from StorageMap where article = (select id from Article where material_number = ?)) OR Select shelf_name from Shelf where Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = (select id from Article where material_number = ?))),';
    sql += ' Select name from StorageRoom where StorageRoom.id = (select current_storage_room from Container where id = (select container from StorageMap where article = (select id from Article where material_number = ?))),';
    sql += ' Select id from Article where material_number = ?';

    connection.query(sql, (err, result) => {
      connection.release();
      if (err) {
        console.log(err);
        return res.status(400).send('Bad query');
      }
      console.log('Storage event has been created!');
      console.log(sql);
      res.send(result);
    });
  });
});

module.exports = router;
