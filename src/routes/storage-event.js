const express = require('express');
const router = express.Router();
const pool = require('../util/connect');

router.get('/', (request, response) => {
    pool.getConnection(function(err, connection) {
        if (err){
          console.log(err);
          response.status(500).send('Cannot connect to server');
        }
        response.send("data-delivery");
    });
});

router.get('/article/:article_id', (request, response) => {
    const { article_id } = request.params;
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        response.status(500).send('Could not connect to server');
      } else {
        let sql = `SELECT DISTINCT StorageEvent.id, StorageEvent.action, StorageEvent.timestamp, StorageEvent.user, StorageEvent.comment, StorageEvent.package, StorageEvent.shelf,`;
        sql += `StorageEvent.storage_room, StorageEvent.article FROM StorageEvent INNER JOIN Article ON StorageEvent.article = ${article_id}`;
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
    let storageroom_id = request.params.storageroom_id;
    pool.getConnection(function(err, connection) {
        if (err){
          console.log(err);
          response.status(500).send('Cannot connect to server');
        }
        response.send("data-delivery storageroom_id: " + storageroom_id);
    });
});


router.post('/create/', (request, response) => {

    const newStorageEvent = {
        name: request.body.name
    }

    pool.getConnection(function(err, connection) {
        if (err){
          console.log(err);
          response.status(500).send('Cannot connect to server');
        }
        response.send(newStorageEvent);
    });
});





module.exports = router;