const express = require('express');
const router = express.Router();


const pool = require('../../connect');

router.get('/', (request, response) => {

    pool.getConnection(function(err, connection) {
        connection.query('SELECT * FROM Article', (err,rows) => {
            connection.release();
            console.log('Data received from Db:\n');
            response.send(rows);
        });
    });
});


module.exports = router;