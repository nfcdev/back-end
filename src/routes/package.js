/* eslint-disable prefer-arrow-callback */
const express = require('express');
const router = express.Router();
const pool = require('../util/connect');

// gets all packages
router.get('/', (request, response) => {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            response.status(500).send('Could not connect to server');
        } else {
            let sql = 'SELECT * FROM Package INNER JOIN Container ON Package.id = Container.id';
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

module.exports = router;
