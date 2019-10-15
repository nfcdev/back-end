const express = require('express');
const router = express.Router();

//Example: Establishing a connection and query to db
const pool = require('../../connect');

router.get('/', (request, response) => {
    let reference_number = request.query.reference_number;
    let material_number = request.query.material_number;
    let location = request.query.location;
    let shelf = request.query.shelf;
    let sql_query = "select * from Article";

    if(reference_number || material_number || location || shelf) sql_query = sql_query + " where ";
    if(reference_number) sql_query = sql_query + "case in (select id from Case where reference_number = 493064) ";

    pool.getConnection(function(err, connection) {
        if (err) console.log(err);


            connection.query(sql_query, [reference_number], (err,rows) => {
                connection.release();
                console.log('Data received from Db:\n');
                response.send(rows);
            });




    });
});


module.exports = router;