const express = require('express');

const router = express.Router();
const pool = require('../util/connect');

const { authenticatedRequest, adminRequest } = require('../util/authentication');

// gets all storagerooms
router.get('/', (request, response) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'SELECT * FROM StorageRoom ';
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
router.get('/branch/:branch_id', (request, response) => {
  const id = request.params.branch_id;
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'SELECT * FROM StorageRoom WHERE branch = ?';
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
router.delete('/:id', (request, response) => {
  const { id } = request.params;
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else {
      const sql = 'DELETE FROM StorageRoom WHERE id = ?';
      connection.query(sql, [id], (err, res) => {
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
router.put('/:id', (request, response) => {
  const { id } = request.params;
  const updatedStorageRoom = request.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      response.status(500).send('Could not connect to server');
    } else if (updatedStorageRoom.name && updatedStorageRoom.branch) {
      // If the name is invalid, nothing updates
      const sql = 'UPDATE StorageRoom SET branch = ?, name = ? WHERE id = ?';
      connection.query(sql, [updatedStorageRoom.branch, updatedStorageRoom.name, id], (err) => {
        connection.release();
        if (err) {
          console.log(err);
          response.status(400).send('Bad query');
        } else {
          console.log('2 data updated');
          response.send('name and branch updated');
        }
      });
    } else if (updatedStorageRoom.name) {
      const sql = 'UPDATE StorageRoom SET name = ? WHERE id = ?';
      connection.query(sql, [updatedStorageRoom.name, id], (err) => {
        connection.release();
        if (err) {
          console.log(err);
          response.status(400).send('Bad query');
        } else {
          console.log('1 data updated');
          response.send('name updated');
        }
      });
    } else if (updatedStorageRoom.branch) {
      const sql = 'UPDATE StorageRoom SET branch = ? WHERE id = ?';
      connection.query(sql, [updatedStorageRoom.branch, id], (err) => {
        connection.release();
        if (err) {
          console.log(err);
          response.status(400).send('Bad query');
        } else {
          console.log('1 data updated');
          response.send('branch updated');
        }
      });
    } else {
      response.status(400).send('Bad request');
    }
  });
});
// creates a new storageroom
router.post('/', (request, response) => {
  const newStorageRoom = {
    name: request.body.name,
    branch: request.body.branch,
  };
  if (!newStorageRoom.branch || !newStorageRoom.name) {
    return response.status(400).send('Bad request');
  }
  pool.getConnection((err, connection) => {
    if (err) {
      console.log(err);
      return response.status(500).send('Could not connect to server');
    }
    const sql = 'INSERT INTO StorageRoom(name, branch) VALUES (?, ?)';
    connection.query(sql, [newStorageRoom.name, newStorageRoom.branch], (err, result) => {
      connection.release();
      if (err) {
        console.log(err);
        return response.status(400).send('Bad query');
      }
      console.log('New room added');
      response.send(result);
    });
  });
});

// dummy route used for checking admin privileges when changing storage room in front-end.
router.post('/change', adminRequest, (req, res) => res.status(204).send('Ok'));

module.exports = router;
