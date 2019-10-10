const express = require('express');
const router = express.Router();
const pool = require('../../connect');


router.get('/', (request, response)=>{
    console.log('inne i case');
    pool.getConnection(function(err, connection) {
        if (err) console.log(err);
        let sql = 'SELECT * FROM Case';
        connection.query(sql, (err, result) => {
          connection.release();
          if (err) console.log(err);
          console.log("Result: " + result);
          response.send(result);
        });
      });
});
router.get('/:id', (request, response)=>{
    console.log('inne i case id');
    let id = request.params.id;
    console.log(id);
    pool.getConnection(function(err, connection) {
        if (err) console.log(err);
        let sql = 'SELECT * FROM Case WHERE ID=?';
        connection.query(sql, [id], (err, result) => {
          connection.release();
          if (err) console.log(err);
          console.log("Result: " + result);
          response.send(result);
        });
      });
});

module.exports = router;