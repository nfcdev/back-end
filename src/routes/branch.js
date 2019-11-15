const express = require('express');
const router = express.Router();
const pool = require('../util/connect');

router.get('/', (request, response) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      response.status(500).send('Cannot connect to server');
    }
    const sql = 'SELECT * FROM Branch';
    connection.query(sql, (err, result) => {
      connection.release();
      if (err) {
        console.log(err);
        response.status(400).send('Bad query');
      }
      console.log('Data received');
      response.send(result);
    });
  });
});
//Can't delete branches already in place, foreign key constraint.
router.delete('/:id', (request, response) => {
  const id = request.params.id;
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'DELETE FROM Branch WHERE id = ?';
      connection.query(sql, [id], function (err, res) {
        connection.release();
        if (err) {
          console.log(err);
          response.status(400).send('Bad query');
        } else if (res.affectedRows) {
          console.log('Branch deleted');
          response.json({ result: "ok" });
        } else {
          response.send('Branch does not exist');
        }
      });
    }
  });
});
//Creates new branch
router.post('/', (request, response) => {
  const name = request.body.name;
  if (!name) {
    return response.status(400).send('Bad request');
  } else {
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return response.status(500).send('Could not connect to server');
      } else {
        const sql = 'INSERT INTO Branch(name) VALUES (?)';
        connection.query(sql, [name], function (err, result) {
          connection.release();
          if (err) {
            console.log(err);
            return response.status(400).send('Bad query');
          } else {
            console.log('New branch added');
            response.json({ id: result.insertId, name: name });
          }
        });
      }
    });
  }
});

router.put('/:id', (request, response) => {
  const id = request.params.id;
  const updatedBranch = request.body;
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'UPDATE Branch SET name = ? WHERE id = ?';
      connection.query(sql, [updatedBranch.name, id], function (err) {
        connection.release();
        if (err) {
          console.log(err);
          response.status(400).send('Bad query');
        } else {
          response.send('Name updated.');
        }
      });
    }
  });
});

module.exports = router;
