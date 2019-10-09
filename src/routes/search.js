const express = require('express');
const router = express.Router();
//const mysql = require('mysql');

router.get('/', (request, response) => {
    console.log('123');
    response.send('hello');
});
router.get('/case/', (request, response)=>{
    console.log('inne i case');
    let sokning = '';
    /*con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        let sql = 'SELECT * FROM Cases ';
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("Result: " + result);
          sokning = result;
        });
      });
    response.send(sokning);*/
    response.send('case utan id');
});
router.get('/case/:id', (request, response)=>{
    console.log('inne i case id');
    let sokning = '';
    let id = request.params.id;
    console.log(id);
    /*con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        let sql = 'SELECT * FROM Cases WHERE ID=?';
        con.query(sql, [id], function (err, result) {
          if (err) throw err;
          console.log("Result: " + result);
          sokning = result;
        });
      });
    response.send(sokning);*/
    response.send(id);
});

module.exports = router;