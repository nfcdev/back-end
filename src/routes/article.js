const express = require('express');
const router = express.Router();

//Example: Establishing a connection and query to db
const pool = require('../../connect');

// Register new article
router.post('/', (req, res) => {
  const newArticle = {
    material_number: req.body.material_number,
    description: req.body.description,
    case: req.body.case
  }
  if (!newArticle.material_number || !newArticle.description || !newArticle.case) {
    res.status(400).send('Bad request');
  } else {
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return res.status(500).send('Could not connect to server');
      }
      let sql = 'INSERT INTO Article(material_number, description, `case`) VALUES (?, ?, ?)';
      let article = [newArticle.material_number, newArticle.description, newArticle.case];
      console.log(sql);
      console.log(article);
      connection.query(sql, article, function (err, result) {
        connection.release();
        if (err) {
          console.log(err);
          return res.status(400).send('Bad query');
        } else {
          console.log('New article added');
          res.send(result);
        }
      });
    });
  }
});



//Return all articles in DB
router.get('/', (req, res) => {
  pool.getConnection(function (err, connection) {

    sql_query = "select Article.material_number, Case.reference_number, StorageRoom.name as 'storage_room',"
    sql_query += " CASE WHEN EXISTS (select package_number from Package where id  = (select container from StorageMap where article = Article.id))"
    sql_query += " THEN (select package_number from Package where id  = (select container from StorageMap where article = Article.id)) ELSE ' - ' END as package,"
    sql_query += " Shelf.shelf_name as 'shelf', se2.action as 'status',se1.timestamp as 'timestamp', se2.timestamp as 'last modified', Article.description"
    sql_query += " FROM Article, `Case`, StorageRoom, Shelf, StorageEvent as se1, StorageEvent as se2"
    sql_query += " WHERE Article.case = Case.id"
    sql_query += " and (StorageRoom.id = (select current_storage_room from Container where id = (select container from StorageMap where article = Article.id)))"
    sql_query += " and (Shelf.id = (select container from StorageMap where article = Article.id) OR Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = Article.id)))"
    sql_query += " AND se1.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp ASC LIMIT 1)"
    sql_query += " AND se2.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp DESC LIMIT 1)";
    sql_query += " ORDER BY Article.material_number asc"

    if (err) console.log(err);
    connection.query(sql_query, (err, result) => {
      connection.release();
      if (err) throw err;
      console.log(res);
      res.send(result)
    });
  });
});

//Return single article
router.get('/:id', (req, res) => {
  let id = req.params.id;
  pool.getConnection(function (err, connection) {
    if (err) console.log(err);

    sql_query = "select Article.material_number, Case.reference_number, StorageRoom.name as 'storage_room',"
    sql_query += " CASE WHEN EXISTS (select package_number from Package where id  = (select container from StorageMap where article = Article.id))"
    sql_query += " THEN (select package_number from Package where id  = (select container from StorageMap where article = Article.id)) ELSE ' - ' END as package,"
    sql_query += " Shelf.shelf_name as 'shelf', se2.action as 'status',se1.timestamp as 'timestamp', se2.timestamp as 'last modified', Article.description"
    sql_query += " FROM Article, `Case`, StorageRoom, Shelf, StorageEvent as se1, StorageEvent as se2"
    sql_query += " WHERE Article.case = Case.id"
    sql_query += " and (StorageRoom.id = (select current_storage_room from Container where id = (select container from StorageMap where article = Article.id)))"
    sql_query += " and (Shelf.id = (select container from StorageMap where article = Article.id) OR Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = Article.id)))"
    sql_query += " AND se1.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp ASC LIMIT 1)"
    sql_query += " AND se2.id = (SELECT id from StorageEvent WHERE article = Article.id ORDER BY timestamp DESC LIMIT 1)";
    sql_query += " AND Article.id = ?"
    sql_query += " ORDER BY Article.material_number asc"

    

    connection.query(sql_query, [id], (err, result) => {
      connection.release();
      if (err) throw err;
      console.log(res);
      res.send(result)
    });
  });
});

module.exports = router;
