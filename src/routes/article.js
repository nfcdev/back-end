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



    let sql1 = 'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, branch, article)';

    sql1 += ' SELECT "processed", 55555, 1, ?, Package.package_number, Shelf.shelf_name, StorageRoom.name as "storageroom", Branch.name, Article.id FROM Package, Shelf, StorageRoom, Branch, Article WHERE';
    
    sql1 += ' Package.id = (select container from StorageMap where article = (select id from Article where material_number = ?)) AND';

    sql1 += ' (Shelf.id = (select container from StorageMap where article = (select id from Article where material_number = ?)) OR Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = (select id from Article where material_number = ?)))) AND';

    sql1 += ' StorageRoom.id = ? AND';

    sql1 += ' Branch.id = (select branch from StorageRoom where id=?) AND';

    sql1 += ' Article.material_number = ?';

    //let sql2 = 'delete from StorageMap where article = (select id from Article where material_number = ?)';
    let sql2 = "select * from StorageEvent";


    let sql3 = 'SELECT "processed" as "action", 55555 as "timestamp", 1 as "user", ? as "comment", Package.package_number as "package", Shelf.shelf_name as "shelf", StorageRoom.name as "storage_room", Branch.name as "branch", Article.id as "article" FROM Package, Shelf, StorageRoom, Branch, Article WHERE';
    
    sql3 += ' Package.id = (select container from StorageMap where article = (select id from Article where material_number = ?)) AND';

    sql3 += ' (Shelf.id = (select container from StorageMap where article = (select id from Article where material_number = ?)) OR Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = (select id from Article where material_number = ?)))) AND';

    sql3 += ' StorageRoom.id = ? AND';

    sql3 += ' Branch.id = (select branch from StorageRoom where id=?) AND';

    sql3 += ' Article.material_number = ?';


    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Could not connect to server');
      }
      connection.query(sql1, [processArticle.comment, processArticle.material_number, processArticle.material_number, processArticle.material_number, processArticle.storage_room, processArticle.storage_room, processArticle.material_number], (err1, result1) => {
        connection.release();
        if (err1) {
          console.log(err1);
          return res.status(400).send('Bad query1');
        }
      });
    });

    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Could not connect to server');
      }
      connection.query(sql2, [processArticle.material_number], (err, result) => {
        connection.release();
        if (err) {
          console.log(err);
          return res.status(400).send('Bad query2');
        }
      });
    });


    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Could not connect to server');
      }
      connection.query(sql3, [processArticle.comment, processArticle.material_number, processArticle.material_number, processArticle.material_number, processArticle.storage_room, processArticle.storage_room, processArticle.material_number], (err, result) => {
        connection.release();
        if (err) {
          console.log(err);
          return res.status(400).send('Bad query3');
        }
       res.send(result);
      });
    });


  }
});

module.exports = router;






