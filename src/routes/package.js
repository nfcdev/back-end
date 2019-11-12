/* eslint-disable prefer-arrow-callback */
const express = require('express');
const router = express.Router();
const pool = require('../util/connect');

//gets all packages
router.get('/', (request, response)=>{
    pool.getConnection(function(err, connection) {
        if (err) {
          console.log(err);
          response.status(500).send('Could not connect to server');
        } else {
        let sql = 'SELECT * FROM Package LEFT JOIN Container ON Package.id = Container.id UNION SELECT * FROM Package RIGHT JOIN Container ON Package.id = Container.id';
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
// creates a new package

router.post('/case/:id', (request, response) => {
    const id = request.params.id;
    const newPackage = {
        shelf: request.body.shelf,
        current_storage_room: request.body.current_storage_room
    }
    if (!newPackage.shelf || !newPackage.current_storage_room) {
        response.status(400).send('Bad request');
    } else {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                return response.status(500).send('Could not connect to server');
            } else {
                let sql = 'INSERT INTO Container(current_storage_room) VALUES (?)';
                connection.query(sql, [newPackage.current_storage_room], function (err1, result) {

                    if (err1) {
                        console.log(err1);
                        response.status(400).send('Bad query1');
                    } else {
                        sql = 'INSERT INTO Package(id, shelf, `case`, package_number) VALUES(?, ?, ?, (CONCAT ((SELECT reference_number FROM `Case` WHERE id = ?),"-",(SELECT COUNT(package_number)+1 FROM Package WHERE `case` = ?))))'
                            connection.query(sql,[result.insertId, newPackage.shelf, id, id, id], function (err2, result1){
                                if (err2){
                                    console.log(err2);
                                    response.status(400).send('Bad query2');

                                } else{
                                    response.send("funka");

                                }

                            })

                    }
                });
            }
        });
    }
});

module.exports = router;