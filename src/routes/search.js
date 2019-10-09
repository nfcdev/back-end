const express = require('express');
const router = express.Router();

//Example: Establishing a connection and query to db
const pool = require('../../connect');

router.get('/', (request, response) => {
    pool.getConnection(function(err, connection) {
        if (err) console.log(err);
        connection.query('SELECT * FROM Article', (err,rows) => {
            connection.release();
            console.log('Data received from Db:\n');
            response.send(rows);
        });
    });
});


module.exports = router;