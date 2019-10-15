const express = require('express');
const router = express.Router();
const pool = require('../../connect');

//Gets all branches
router.get('/', (request, response)=>{
    pool.getConnection(function(err, connection) {
        if (err){
          console.log(err);
          response.status(500).send('Cannot conect to server');
        }
        let sql = 'SELECT * FROM Branch';
        connection.query(sql, (err, result) => {
          connection.release();
          if (err){
            console.log(err);
            response.status(500).send('Bad query');
          }
          console.log("Data received");
          response.send(result);
        });
      });
});

//Create a new branch
router.post('/', (request, response)=>{
    const newBranch = {
        name: request.body.name
    }
    if(!newBranch) {
        response.status(400).send('Bad request');
    } else {
        pool.getConnection(function(err, connection) {
            if (err){
            console.log(err);
            response.status(500).send('Cannot conect to server');
          }
          let sql = 'INSERT INTO Branch(name) VALUES (?)';
          connection.query(sql, newBranch.name, function (err, result) {
            connection.release();
            if (err) {
                console.log(err);
                response.status(400).send('Bad query');
              } else {
              console.log('New branch added');
             response.send(result);
              }
            });
        });
    }
});

module.exports = router;