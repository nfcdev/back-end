const express = require('express');

const router = express.Router();

// Example: Establishing a connection and query to db
const pool = require('../../connect');

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

  let sql = 'INSERT INTO StorageEvent (timestamp) VALUES (Select UNIX_TIMESTAMP)';

});

module.exports = router;