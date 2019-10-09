const express = require('express');
const router = express.Router();
//const mysql = require('mysql');

//gets all storagerooms
router.get('/', (request, response)=>{
    console.log('inne i storageroom');
    //let sokning = '';
    /*con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        let sql = 'SELECT * FROM StorageRooms ';
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("Result: " + result);
          sokning = result;
        });
      });
    response.send(sokning);*/
    response.send('alla storagerooms');
});

//gets all storagerooms belonging to a specifik branch
router.get('/branch/:branch_id', (request, response)=>{
    console.log('inne i storageroom branch id');
    //let sokning = '';
    const id = request.params.branch_id;
    console.log(id);
    /*con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        let sql = 'SELECT * FROM StorageRooms WHERE branch_id = ?';
        con.query(sql, [id], function (err, result) {
          if (err) throw err;
          console.log("Result: " + result);
          sokning = result;
        });
      });
    response.send(sokning);*/
    response.send(id);
});
//deletes a storageroom
router.delete('/:id', (request, response) =>{
const id = request.params.id;
    /*con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        let sql = 'DELETE FROM StorageRooms WHERE id = ?';
        con.query(sql, [id], function (err, result) {
          if (err) throw err;
          console.log("Result: " + result);
        });
      });*/
      response.send(`${id} deleted`);
});
//edits a storageroom
router.put('/:id', (request, response) =>{
const id = request.params.id;
const updatedStorageRoom = request.body;

    /*con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        if (updatedStorageRoom.name & updatedStorageRoom.branch){   
        let sql = 'UPDATE storagerooms SET name = ?, branch = ? WHERE id = ?';
        con.query(sql, [updatedStorageRoom.name, updatedStorageRoom.branch, id], function (err, result) {
          if (err) throw err;
          console.log("Result: " + result);
        });
    } else if (updatedStorageRoom.name){
        let sql = 'UPDATE storagerooms SET name = ? WHERE id = ?';
        con.query(sql, [updatedStorageRoom.name,id], function (err, result) {
          if (err) throw err;
          console.log("Result: " + result);
        });
    } else if (updatedStorageRoom.branch){
        let sql = 'UPDATE storagerooms SET branch = ? WHERE id = ?';
        con.query(sql, [updatedStorageRoom.branch, id], function (err, result) {
          if (err) throw err;
          console.log("Result: " + result);
        });
    }
      });*/
      response.send(`${updatedStorageRoom.name} och ${updatedStorageRoom.branch} from id ${id}`);
});
//creates a new storageroom
router.post('/', (request, response) =>{
const newStorageRoom = {
    id : request.body.id,
    name : request.body.name,
    branch : request.body.branch
}
    /*con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        let sql = 'INSERT INTO StorageRooms VALUES ?';
        con.query(sql, [newStorageRoom], function (err, result) {
          if (err) throw err;
          console.log("Result: " + result);
          sokning = result;
        });
      });
    response.send(sokning);*/
response.send(newStorageRoom);
});


module.exports = router;

