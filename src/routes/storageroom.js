/* eslint-disable prefer-arrow-callback */
const express = require('express');
const router = express.Router();
const pool = require('../util/connect');
const { authenticatedRequest, adminAuthorizedRequest } = require('../util/authentication');

// gets all storagerooms
router.get('/', authenticatedRequest, (request, response) => {
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      let sql = 'SELECT * FROM StorageRoom';
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

// gets all storagerooms belonging to a specifik branch
router.get('/branch/:branch_id', authenticatedRequest, (request, response) => {
  const id = request.params.branch_id;
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      let sql = 'SELECT * FROM StorageRoom WHERE branch = ?';
      connection.query(sql, [id], (err, result) => {
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

// deletes a storageroom
router.delete('/:id', adminAuthorizedRequest, (request, response) => {
  const id = request.params.id;
  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      let sql = 'DELETE FROM StorageRoom WHERE id = ?';
      connection.query(sql, [id], function (err, res) {
        connection.release();
        if (err) {
          console.log(err);
          response.status(400).send('Bad query');
        } else if (res.affectedRows) {
          console.log('Room deleted');
          response.send(`${id} deleted`);
        } else {
          response.send('Room does not exist');
        }
      });
    }
  });
});

// edits a storageroom
router.put('/:id', adminAuthorizedRequest, (request, response) => {
  const id = request.params.id;
  const updatedStorageRoom = request.body;

  pool.getConnection(function (err, connection) {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      //If the name is invalid, nothing updates
      if (updatedStorageRoom.name && updatedStorageRoom.branch) {
        let sql = 'UPDATE StorageRoom SET branch = ?, name = ? WHERE id = ?';
        connection.query(sql, [updatedStorageRoom.branch, updatedStorageRoom.name, id], function (err) {
          connection.release();
          if (err) {
            console.log(err);
            response.status(400).send('Bad query');
          } else {
            console.log('2 data updated');
            response.json({ id: id, name: updatedStorageRoom.name, branch: updatedStorageRoom.branch });
          }
        });
      } else if (updatedStorageRoom.name) {
        // Gets and saves the branchnumber to use later in the json response since the user has not entered a branchnumber in the request.
        let branchNumber;
        connection.query(`SELECT StorageRoom.branch FROM StorageRoom WHERE StorageRoom.id = ${id}`, function (err, result) {
          branchNumber = JSON.parse(JSON.stringify(result[0]["branch"]));
        });

        let sql = 'UPDATE StorageRoom SET name = ? WHERE id = ?';
        connection.query(sql, [updatedStorageRoom.name, id], function (err) {
          connection.release();
          if (err) {
            console.log(err);
            response.status(400).send('Bad query');
          } else {
            console.log('1 data updated');
            response.json({ id: id, name: updatedStorageRoom.name, branch: branchNumber });
          }
        });
      } else if (updatedStorageRoom.branch) {
        let roomName;
        // Gets and saves the storageroom name to use later in the json response since the user has not entered a name in the request.
        connection.query(`SELECT StorageRoom.name FROM StorageRoom WHERE StorageRoom.id = ${id}`, function (err, result) {
          roomName = JSON.parse(JSON.stringify(result[0]['name']));
        });
        let sql = 'UPDATE StorageRoom SET branch = ? WHERE id = ?';
        connection.query(sql, [updatedStorageRoom.branch, id], function (err) {
          connection.release();
          if (err) {
            console.log(err);
            response.status(400).send('Bad query');
          } else {
            console.log('1 data updated');
            response.json({ id: id, name: updatedStorageRoom.name, name: roomName, branch: updatedStorageRoom.branch });
          }
        });
      } else {
        response.status(400).send('Bad request');
      }
    }
  });
});

// creates a new storageroom
router.post('/', adminAuthorizedRequest, (request, response) => {
  const newStorageRoom = {
    name: request.body.name,
    branch: request.body.branch,
  };
  if (!newStorageRoom.branch || !newStorageRoom.name) {
    response.status(400).send('Bad request');
  } else {
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        response.status(500).send('Could not connect to server');
      } else {
        let sql = 'INSERT INTO StorageRoom(name, branch) VALUES (?, ?)';
        connection.query(sql, [newStorageRoom.name, newStorageRoom.branch], function (err, result) {
          connection.release();
          if (err) {
            console.log(err);
            response.status(400).send('Bad query');
          } else {
            console.log('New room added');
            response.json({ id: result.insertId, name: newStorageRoom.name, branch: newStorageRoom.branch });
          }
        });
      }
    });
  }
});

module.exports = router;
