const express = require('express');

const router = express.Router();
const pool = require('../util/connect');

router.get('/', (request, response) => {
<<<<<<< HEAD
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            response.status(500).send('Cannot conect to server');
        }
        response.send("data-delivery");
    });
=======
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      response.status(500).send('Cannot connect to server');
    }
    response.send('data-delivery');
  });
>>>>>>> e89e681e9d806dec7874b8cadfceea2c30ecbb46
});

router.get('/article/:article_id', (request, response) => {
<<<<<<< HEAD
    let article_id = request.params.article_id;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            response.status(500).send('Cannot conect to server');
=======
  const { article_id } = request.params;
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      let sql =        'SELECT DISTINCT StorageEvent.id, StorageEvent.action, StorageEvent.timestamp, StorageEvent.user, StorageEvent.comment, StorageEvent.package, StorageEvent.shelf,';
      sql += `StorageEvent.storage_room, StorageEvent.article FROM StorageEvent INNER JOIN Article ON StorageEvent.article = ${article_id}`;
      connection.query(sql, [article_id], (err, result) => {
        connection.release();
        if (err) {
          console.log(err);
          response.status(400).send('Bad query');
        } else {
          console.log('Data received');
          response.send(result);
>>>>>>> e89e681e9d806dec7874b8cadfceea2c30ecbb46
        }
      });
    }
  });
});

router.get('/storageroom/:storageroom_id', (request, response) => {
<<<<<<< HEAD
    let storageroom_id = request.params.storageroom_id;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            response.status(500).send('Cannot conect to server');
        }
        response.send("data-delivery storageroom_id: " + storageroom_id);
    });
});


router.post('/create/', (request, response) => {

    const newStorageEvent = {
        name: request.body.name
    }

    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            response.status(500).send('Cannot conect to server');
        }
        response.send(newStorageEvent);
=======
  const { storageroom_id } = request.params;
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      response.status(500).send('Cannot connect to server');
    }
    const sql =      'SELECT StorageEvent.id, StorageEvent.action, StorageEvent.timestamp,StorageEvent.user, StorageEvent.comment, StorageEvent.package, StorageEvent.shelf, StorageEvent.storage_room, StorageEvent.article FROM StorageEvent INNER JOIN StorageRoom ON StorageEvent.storage_room = StorageRoom.name WHERE StorageRoom.name IN (SELECT name FROM StorageRoom WHERE StorageRoom.id = ?)';
    connection.query(sql, [storageroom_id], (err, result) => {
      connection.release();
      if (err) {
        console.log(err);
        response.status(400).send('Bad query');
      } else {
        console.log('Data received');
        response.send(result);
      }
>>>>>>> e89e681e9d806dec7874b8cadfceea2c30ecbb46
    });
  });
});

module.exports = router;
