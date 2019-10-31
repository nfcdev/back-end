const express = require('express');
const router = express.Router();
const pool = require('../../connect');

//gets all packages
router.get('/', (request, response)=>{
    pool.getConnection(function(err, connection) {
        if (err) {
          console.log(err);
          response.status(500).send('Could not connect to server');
        } else {
        let sql = 'SELECT * FROM Package ';
        connection.query(sql, (err, result) => {
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

//gets all packages belonging to a specifik branch
router.get('/branch/:branch_id', (request, response)=>{
    const branch_id = request.params.branch_id;
    pool.getConnection(function(err, connection) {
        if (err) {
          console.log(err);
          response.status(500).send('Could not connect to server');
        } else{
        let sql = 'SELECT * FROM Package WHERE id IN (SELECT id FROM Container WHERE Current_Storage_Room IN (SELECT id FROM StorageRoom WHERE Branch = ?))';
        connection.query(sql, [branch_id], (err, result) =>{
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

//gets all packages belonging to a specifik storageroom
router.get('/storageroom/:storageroom_id', (request, response)=>{
    const storageroom_id = request.params.storageroom_id;
    pool.getConnection(function(err, connection) {
        if (err) {
          console.log(err);
          response.status(500).send('Could not connect to server');
        } else{
        let sql = 'SELECT * FROM Package WHERE id IN (SELECT id FROM Container WHERE Current_Storage_Room = ?)';
        connection.query(sql, [storageroom_id], (err, result) =>{
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

//creates a new package
router.post('/', (request, response) =>{
    const newPackage = {
        shelf : request.body.shelf,
        case : request.body.case,
        package_number : request.body.package_number,
        id : request.body.id
    }
    if(!newPackage.shelf || !newPackage.case || !newPackage.package_number || !newPackage.id){
    return  response.status(400).send('Bad request');
    } else {
        pool.getConnection(function(err, connection) {
          if (err) {
            console.log(err);
          return  response.status(500).send('Could not connect to server');
          } else {
            let sql = 'INSERT INTO Package(shelf, `case`, package_number, id) VALUES (?, ?, ?, ?)';
            connection.query(sql, [newPackage.shelf, newPackage.case, newPackage.package_number, newPackage.id], function (err, result) {
              connection.release();
              if (err) {
                console.log(err);
              return  response.status(400).send('Bad query');
              } else{
              console.log('New package added');
             response.send(result);
              }
            });
          }
          });
        }
    });

    //deletes a package
router.delete('/:id', (request, response) =>{
    const id = request.params.id;
        pool.getConnection(function(err, connection) {
            if (err) {
              console.log(err);
              response.status(500).send('Could not connect to server');
            } else {
            let sql = 'DELETE FROM Package WHERE id = ?';
            connection.query(sql, [id], function (err, res) {
              connection.release();
              if (err) {
                console.log(err);
                response.status(400).send('Bad query');
              } else if(res.affectedRows){
              console.log('Package deleted');
              response.send(`${id} deleted`);
                } else{
                  response.send('Package does not exist');
              }
            });
          }
          });
    });

module.exports = router;