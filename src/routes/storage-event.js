const express = require('express');

const router = express.Router();
const pool = require('../util/connect');

router.get('/', (request, response) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      response.status(500).send('Cannot connect to server');
    }
    response.send('data-delivery');
  });
});

router.get('/article/:article_id', (request, response) => {
  const { article_id } = request.params;
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'SELECT * FROM StorageEvent WHERE Article = ?';
      connection.query(sql, [article_id], (err, result) => {
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

router.get('/storageroom/:storageroom_id', (request, response) => {
  const { storageroom_id } = request.params;
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      response.status(500).send('Cannot connect to server');
    }
    const sql = 'SELECT * FROM StorageEvent WHERE storage_room = (SELECT name FROM StorageRoom WHERE StorageRoom.id = ?)';
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
  });
});

module.exports = router;
