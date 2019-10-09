const express = require('express');
const router = express.Router();

// const mysql = require('mysql');

// // Create connection
// const con = mysql.createConnection({
//   host: "localhost",
//   user: "yourusername",
//   password: "yourpassword",
//   database: "mydb"
// });

// Create table
// con.connect(function (err) {
//   if (err) throw err;
//   console.log("Connected!");
//   app.get('/createarticlestable', (req, res) => {
//     let sql = 'CREATE TABLE articles (barcode_id int AUTO-INCREMENT, name VARCHAR(255), desc VARCHAR(255), parent VARCHAR(255), case VARCHAR(255), PRIMARY KEY barcode_id)';
//     con.query(sql, (err, result) => {
//       if (err) throw err;
//       console.log(result);
//       res.send('Articles table created...')
//     });
//   });
// });

  // Register new article
  router.post('/addarticle', (req, res) => {
    const article = { 
      id: req.body.id,
      name: req.body.name,
      desc: req.body.desc,
      case: req.body.case,
      parent: req.body.parent
    };
  });

    // let sql = 'INSERT INTO articles SET ?';
    // let query = con.query(sql, article, (err, result) => {
  //     if (err) throw err;
  //     console.log(result);
  //     res.send('Article one...')
  //   });
  // });

  //Return all articles in DB
  router.get('/getarticles', (req, res) => {
    let sql = 'SELECT * FROM articles';
    let query = con.query(sql, article, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.send('Articles fetched')
    });
  });

  //Return single article
  router.get('/getarticle/:id', (req, res) => {
    let sql = 'SELECT * FROM articles WHERE id = ${req.params.id}';
    let query = con.query(sql, article, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.send('Article fetched')
    });
  });

  module.exports = router;
