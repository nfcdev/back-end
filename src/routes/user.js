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
        }
        const sql = 'SELECT * FROM User';
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

module.exports = router;