const express = require('express');
const router = express.Router();
const pool = require('../../connect');

//gets all storagerooms
router.get('/', (request, response)=>{
    pool.getConnection(function(err, connection) {
        if (err) {
          console.log(err);
          response.status(500).send('Could not connect to server');
        }
        let sql = 'SELECT * FROM StorageRoom ';
        connection.query(sql, (err, result) => {
          connection.release();
          if (err) {
            console.log(err);
            response.status(400).send('Bad query');
          }
          console.log('Data received');
          response.send(result);
        });
      });
});

//gets all storagerooms belonging to a specifik branch
router.get('/branch/:branch_id', (request, response)=>{
    const id = request.params.branch_id;
    pool.getConnection(function(err, connection) {
        if (err) {
          console.log(err);
          response.status(500).send('Could not connect to server');
        }
        let sql = 'SELECT * FROM StorageRoom WHERE branch = ?';
        connection.query(sql, [id], (err, result) =>{
          connection.release();
          if (err) {
            console.log(err);
            response.status(400).send('Bad query');
          }
          console.log('Data received');
          response.send(result);
        });
      });
});
//deletes a storageroom
router.delete('/:id', (request, response) =>{
const id = request.params.id;
    pool.getConnection(function(err, connection) {
        if (err) {
          console.log(err);
          response.status(500).send('Could not connect to server');
        }
        let sql = 'DELETE FROM StorageRoom WHERE id = ?';
        connection.query(sql, [id], function (err) {
          connection.release();
          if (err) {
            console.log(err);
            response.status(400).send('Bad query');
          }
          console.log('Room deleted');
          response.send(`${id} deleted`);
        });
      });
});
//edits a storageroom
router.put('/:id', (request, response) =>{
const id = request.params.id;
const updatedStorageRoom = request.body;

    pool.getConnection(function(err, connection) {
      if (err) {
        console.log(err);
        response.status(500).send('Could not connect to server');
      }
        if (updatedStorageRoom.name && updatedStorageRoom.branch){   
        let sql = 'UPDATE StorageRoom SET branch = ?, name = ? WHERE id = ?';
        connection.query(sql, [updatedStorageRoom.branch, updatedStorageRoom.name, id], function (err) {
          connection.release();
          if (err) {
            console.log(err);
            response.status(400).send('Bad query');
          }
          console.log('2 data updated');
        });
    } else if (updatedStorageRoom.name){
        let sql = 'UPDATE StorageRoom SET name = ? WHERE id = ?';
        connection.query(sql, [updatedStorageRoom.name,id], function (err) {
          connection.release();
          if (err) {
            console.log(err);
            response.status(400).send('Bad query');
          }
          console.log('1 data updated');
        });
    } else if (updatedStorageRoom.branch){
        let sql = 'UPDATE StorageRoom SET branch = ? WHERE id = ?';
        connection.query(sql, [updatedStorageRoom.branch, id], function (err) {
          connection.release();
          if (err) {
            console.log(err);
            response.status(400).send('Bad query');
          }
          console.log('1 data updated');
        });
    } else {
      response.status(400).send('Bad request');
    }
      });
      response.send(`${updatedStorageRoom.name} and ${updatedStorageRoom.branch} from id ${id}`);
});
//creates a new storageroom
router.post('/', (request, response) =>{
const newStorageRoom = {
    name : request.body.name,
    branch : request.body.branch
}
if(!newStorageRoom.branch || !newStorageRoom.name){
  response.status(400).send('Bad request');
} else {
    pool.getConnection(function(err, connection) {
      if (err) {
        console.log(err);
        response.status(500).send('Could not connect to server');
      }
        let sql = 'INSERT INTO StorageRoom(name, branch) VALUES (?, ?)';
        connection.query(sql, [newStorageRoom.name, newStorageRoom.branch], function (err, result) {
          connection.release();
          if (err) {
            console.log(err);
            response.status(400).send('Bad query');
          }
          console.log('New room added');
         response.send(result);
        });
      });
    }
});


module.exports = router;

