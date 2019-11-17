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

      let sql = 'Delete from StorageMap where article = (select id from Article where material_number = ?)';

      let sql2 = 'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, article)';
      sql2 += ' VALUES ("processed", Select UNIX_TIMESTAMP(), 1, ?,';
      sql2 += ' Select package from Package where Package.id = (select id from Container where Container.id = (select container from StorageMap where article = (select id from Article where material_number = ?,)))';
      sql2 += ' Select shelf_name from Shelf where Shelf.id = (select container from StorageMap where article = (select id from Article where material_number = ?)) OR Select shelf_name from Shelf where Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = (select id from Article where material_number = ?))),';
      sql2 += ' Select name from StorageRoom where StorageRoom.id = (select current_storage_room from Container where id = (select container from StorageMap where article = (select id from Article where material_number = ?))),';
      sql2 += ' Select id from Article where material_number = ?';

      // eslint-disable-next-line consistent-return
      connection.query(sql, [processArticle.material_number], (err, result) => {
        connection.release();
        if (err) {
          console.log(err);
          return res.status(400).send('Bad query');
        }
        console.log('Article has been processed!');
        console.log(sql);
        res.send(result);
      });

      connection.query(sql2, [processArticle.material_number], (err, result) => {
        connection.release();
        if (err) {
          console.log(err);
          return res.status(400).send('Bad query');
        }
        console.log('Article has been processed!');
        console.log(sql2);
        res.send(result);
      });
    });
  }
});

module.exports = router;
