/* eslint-disable prefer-arrow-callback */
const express = require('express');
const util = require('util');
const { authenticatedRequest, adminAuthorizedRequest } = require('../util/authentication');
const router = express.Router();
const pool = require('../util/connect');

router.get('/', adminAuthorizedRequest, (request, response) => {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            response.status(500).send('Cannot connect to server');
        } else {
            const sql = 'SELECT * FROM User';
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
// Gets all info about the logged in user
router.get('/me', authenticatedRequest, (request, response) => {
    response.send(request.user);
});


router.put('/', adminAuthorizedRequest, (request, response) => {
    const updatedUser = request.body;
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            response.status(500).send('Could not connect to server');
        } else {
            const sql = 'UPDATE User SET role = ? WHERE shortcode = ?';
            connection.query(sql, [updatedUser.role, updatedUser.shortcode], function (err, result) {
                connection.release();
                if (err || !result.affectedRows) {
                    console.log(err);
                    response.status(400).send('Bad query');
                } else {
                    response.json({ shortcode: updatedUser.shortcode, role: updatedUser.role });
                }
            });
        }
    });
});



// Gets all materialnumbers for articles that are checked out by the logged in user
router.get('/material', authenticatedRequest, (request, response) => {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            response.status(500).send('Cannot connect to server');
        } else {
            const sql = '(SELECT material_number FROM Article_information WHERE id IN (SELECT article FROM StorageEvent WHERE user = ? AND timestamp IN(SELECT MAX(timestamp) FROM StorageEvent GROUP BY article))) INTERSECT (SELECT material_number FROM Article_information WHERE status = "checked_out") ';
            connection.query(sql, [request.user.shortcode], (err, result) => {
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

module.exports = router;