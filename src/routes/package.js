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
// deletes a package

router.delete('/:id', (request, response) => {
    const id = request.params.id;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            response.status(500).send('Could not connect to server');
        } else {
            let sql = 'DELETE pa, co FROM Package pa JOIN Container co ON pa.id = co.id WHERE pa.id = ?';
            connection.query(sql, [id], function (err, res) {
                connection.release();
                if (err) {
                    console.log(err);
                    response.status(400).send('Bad query');
                } else if (res.affectedRows) {
                    console.log('Package deleted');
                    response.json({"result":"ok"});
                } else {
                    response.send('Package does not exist');
                }
            });
        }
    });
});

module.exports = router;
