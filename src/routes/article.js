const express = require('express');
const router = express.Router();
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

    let sql1 = 'INSERT INTO StorageEvent (action, timestamp, user, comment, package, shelf, storage_room, branch, article)';
    sql1 += 'SELECT "processed", 55555, 1, ?,';
    sql1 += ' CASE WHEN EXISTS (select package_number from Package where id  = (select container from StorageMap where article = (select id from Article where material_number = ?)))';
    sql1 += " THEN (select package_number from Package where id  = (select container from StorageMap where article = (select id from Article where material_number = ?))) ELSE ' - ' END as package,";
    sql1 += ' Shelf.shelf_name, StorageRoom.name as "storageroom", Branch.name, Article.id FROM Shelf, StorageRoom, Branch, Article WHERE';
    sql1 += ' (Shelf.id = (select container from StorageMap where article = (select id from Article where material_number = ?)) OR Shelf.id = (select shelf from Package where id = (select container from StorageMap where article = (select id from Article where material_number = ?)))) AND';
    sql1 += ' StorageRoom.id = ? AND';
    sql1 += ' Branch.id = (select branch from StorageRoom where id=?) AND';
    sql1 += ' Article.material_number = ?';

    let array1 = [
      processArticle.comment, 
      processArticle.material_number, 
      processArticle.material_number, 
      processArticle.material_number, 
      processArticle.material_number, 
      processArticle.storage_room, 
      processArticle.storage_room, 
      processArticle.material_number];

    
    let sql2 = 'delete from StorageMap where article = (select id from Article where material_number = ?)';
    
    let array2 = [processArticle.material_number];

    
    let sql3 = 'select * from StorageEvent order by id desc limit 1';
    //sql3 = "select material_number from Article where id in (select article from StorageMap)";
    
    pool.getConnection((err0, connection) => {
      if (err0) {
        console.log(err0);
        return res.status(500).send('Could not connect to server');
      }
      else{
        connection.beginTransaction(function(err1){
          if(err1){
            console.log(err1);
            res.status(500).send('Could not start transaction');
          }
          else{
            connection.query(sql1, array1, function(err2, result2){ // inserts data into StorageEvent
              if(err2){
                connection.rollback(function(){
                  console.log(err2);
                  res.status(400).send('Bad query');
                });
              }
              else{
                if(result2.affectedRows == 1){ // checks whether 1 entry was inserted in storageevent, ie, if the material number exists.

                    connection.query(sql2, array2, function(err4, result4){ //deletes entry in storagemap
                      if(err4){
                        connection.rollback(function(){
                          console.log(err4);
                          res.status(400).send('Bad query');
                        });
                      }
                      else{
                        connection.query(sql3, function(err5, result5){ // displays storageevent entry with highest id
                          if(err5){
                            connection.rollback(function(){
                              console.log(err5);
                              res.status(400).send('Bad query');
                            });
                          }
                          else{
                              connection.commit(function(err9){
                                if(err9){
                                  connection.rollback(function(){
                                    console.log(err9);
                                  });
                                }
                                else{
                                  res.send(result5);
                                  console.log('Transaction Complete.');
                                }
                              });
                          }
                        });
                      }
                    });
                }
                else{
                  res.status(400).send('Material number does not exist.');
                }
              }
            });
          }
        });
        connection.release();
      }
    });
  }
});

module.exports = router;






