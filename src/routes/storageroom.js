const express = require('express');
const router = express.Router();
const pool = require('../../connect');
//const mysql = require('mysql');

//gets all storagerooms
router.get('/', (request, response)=>{
    console.log('inne i storageroom');
    pool.getConnection(function(err, connection) {
        if (err) console.log(err);
        let sql = 'SELECT * FROM StorageRoom ';
        connection.query(sql, (err, result) => {
          connection.release();
          if (err) console.log(err);
          response.send(result);
        });
      });
});

//gets all storagerooms belonging to a specifik branch
router.get('/branch/:branch_id', (request, response)=>{
    console.log('inne i storageroom branch id');
    const id = request.params.branch_id;
    console.log(id);
    pool.getConnection(function(err, connection) {
        if (err) console.log(err);
        let sql = 'SELECT * FROM StorageRoom WHERE branch_id = ?';
        connection.query(sql, [id], (err, result) =>{
          if (err) console.log(err);
          console.log("Data recieved");
          response.send(result);
        });
      });
});
//deletes a storageroom
router.delete('/:id', (request, response) =>{
const id = request.params.id;
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        console.log("Connected!");
        let sql = 'DELETE FROM StorageRoom WHERE id = ?';
        connection.query(sql, [id], function (err, result) {
          if (err) throw err;
          console.log("Result: " + result);
        });
      });
      response.send(`${id} deleted`);
});
//edits a storageroom
router.put('/:id', (request, response) =>{
const id = request.params.id;
const updatedStorageRoom = request.body;

    pool.getConnection(function(err, connection) {
        if (err) throw err;
        if (updatedStorageRoom.name & updatedStorageRoom.branch){   
        let sql = 'UPDATE StorageRoom SET name = ?, branch = ? WHERE id = ?';
        connection.query(sql, [updatedStorageRoom.name, updatedStorageRoom.branch, id], function (err, result) {
          if (err) throw err;
          console.log("Result: " + result);
        });
    } else if (updatedStorageRoom.name){
        let sql = 'UPDATE StorageRoom SET name = ? WHERE id = ?';
        connection.query(sql, [updatedStorageRoom.name,id], function (err, result) {
          if (err) throw err;
          console.log("Result: " + result);
        });
    } else if (updatedStorageRoom.branch){
        let sql = 'UPDATE StorageRoom SET branch = ? WHERE id = ?';
        connection.query(sql, [updatedStorageRoom.branch, id], function (err, result) {
          if (err) throw err;
          console.log("Result: " + result);
        });
    }
      });
      response.send(`${updatedStorageRoom.name} och ${updatedStorageRoom.branch} from id ${id}`);
});
//creates a new storageroom
router.post('/', (request, response) =>{
const newStorageRoom = {
    id : request.body.id,
    name : request.body.name,
    branch : request.body.branch
}
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        let sql = 'INSERT INTO StorageRoom VALUES ?';
        connection.query(sql, [newStorageRoom], function (err, result) {
          if (err) throw err;
          console.log("Result: " + result);
         response.send(result);
        });
      });
});


module.exports = router;

