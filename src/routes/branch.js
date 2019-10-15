const express = require('express');
const router = express.Router();
const pool = require('../../connect');

router.get('/', (request, response)=>{
    pool.getConnection(function(err, connection) {
        if (err){
          console.log(err);
          response.status(500).send('Cannot connect to server');
        }
        let sql = 'SELECT * FROM Branch';
        connection.query(sql, (err, result) => {
          connection.release();
          if (err){
            console.log(err);
            response.status(400).send('Bad query');
          }
          console.log("Data received");
          response.send(result);
        });
      });
});

router.delete('/:id', (request, response) =>{
  const id = request.params.id;
      pool.getConnection(function(err, connection) {
          if (err) {
            console.log(err);
            response.status(500).send('Could not connect to server');
          } else {
          let sql = 'DELETE FROM Branch WHERE id = ?';
          connection.query(sql, [id], function (err, res) {
            connection.release();
            if (err) {
              console.log(err);
              response.status(400).send('Bad query');
            } else if(res.affectedRows){
            console.log('Branch deleted');
            response.send(`${id} deleted`);
              } else{
                response.send('Branch does not exist');
            }
          });
        }
        });
  });

  router.post('/', (request, response) =>{
    const newBranch = {
      name : request.body.name
    }
    if(!newBranch.name) {
    return  response.status(400).send('Bad request');
    } else {
        pool.getConnection(function(err, connection) {
          if (err) {
            console.log(err);
          return  response.status(500).send('Could not connect to server');
          } else {
            let sql = 'INSERT INTO Branch(name) VALUES (?)';
            connection.query(sql, [newBranch.name], function (err, result) {
              connection.release();
              if (err) {
                console.log(err);
              return  response.status(400).send('Bad query');
              } else{
              console.log('New branch added');
              response.send(result);
              }
            });
          }
          });
        }
    });

    router.put('/:id', (request, response) =>{
      const id = request.params.id;
      const updatedBranch = request.body;

         pool.getConnection(function(err, connection) {
           if (err) {
             console.log(err);
             response.status(500).send('Could not connect to server');
           } else {
             let sql = 'UPDATE Branch SET name = ? WHERE id = ?';
             connection.query(sql, [updatedBranch.name,id], function (err) {
               connection.release();
               if (err) {
                 console.log(err);
                 response.status(400).send('Bad query');
               }else{
                 console.log('1 data updated');
                 response.send('name updated');
               }
              
            });
          }
            });
          });
    
module.exports = router;