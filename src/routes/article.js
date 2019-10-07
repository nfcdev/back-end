const express = require('express');
const router = express.Router();

const mysql = require('mysql');


// Create table
app.get('/createarticlestable', (req, res) => {
  let sql = 'CREATE TABLE articles (barcode_id int AUTO-INCREMENT, name VARCHAR(255), desc, parent, case, PRIMARY KEY (barcode_id)
)';
  db.query(sql, (err, result) => {
    if(err) throw err;
    console.log(result);
    res.send('Articles table created...')
  });
});

// Register new article
app.get('/addpost', (req, res) => {
  let article = {name: 'Article one'};
  let sql = 'INSERT INTO articles SET ?';
  let query = db.query(sql, article, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send('Article one...')
  });
});

//Return all items in DB
app.get('/getarticles', (req, res) => {
  let sql = 'SELECT * FROM articles';
  let query = db.query(sql, article, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send('Articles fetched')
    });
});

//Return single article
app.get('/getarticle/:id', (req, res) => {
  let sql = 'SELECT * FROM articles WHERE id = ${req.params.id}';
  let query = db.query(sql, article, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send('Article fetched')
    });
});
