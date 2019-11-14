/* eslint-disable prefer-arrow-callback */
const express = require('express');
const router = express.Router();
const pool = require('../util/connect');


// creates a new package

router.post('/case/:id', (request, response) => {
    const id = request.params.id;
    const newPackage = {
        shelf: request.body.shelf,
        current_storage_room: request.body.current_storage_room
    }

    if (!newPackage.shelf || !newPackage.current_storage_room) {
        response.status(400).send('Bad request');
    } else {
        pool.getConnection(function (err, connection) {

            if (err) {
                console.log(err);
                response.status(500).send('Could not connect to server');
            } else {
                connection.beginTransaction(function (err0) {
                    if (err0) {
                        console.log(err0);
                        response.status(500).send('Could not start transaction');

                    } else {
                        // Creates the container that is the package
                        let sql = 'INSERT INTO Container(current_storage_room) VALUES (?)';
                        connection.query(sql, [newPackage.current_storage_room], function (err1, result) {

                            if (err1) {
                                connection.rollback(function () {
                                    console.log(err1);
                                    response.status(400).send('Bad query');
                                });

                            } else {
                                //Calculates how many packages the case has already to be able to get an accurate package_number
                                sql = 'SELECT COUNT(package_number)+1 AS orderstamp FROM Package WHERE `case` = ?';
                                connection.query(sql, [id], function (err2, result1) {
                                    if (err2) {
                                        connection.rollback(function () {
                                            console.log(err2);
                                            response.status(400).send('Bad query');
                                        });


                                    } else {
                                        //Creates the package
                                        sql = 'INSERT INTO Package(id, shelf, `case`, package_number) VALUES(?, ?, ?, (CONCAT ((SELECT reference_number FROM `Case` WHERE id = ?),"-K",?)))';
                                        // Over 99 packages for a case is not supported with this solution
                                        connection.query(sql, [result.insertId, newPackage.shelf, id, id, ('0' + result1[0].orderstamp).slice(-2)], function (err3, result2) {
                                            if (err3) {

                                                connection.rollback(function () {
                                                    console.log(err3);
                                                    response.status(400).send('Bad query');
                                                });
                                            } else {
                                                // Gets the package_number for an accurate return message. Maybe possible to do in a better way, but this works.
                                                sql = 'SELECT package_number AS pn FROM Package WHERE id=?';
                                                connection.query(sql, [result.insertId], function (err4, result3) {
                                                    if (err4) {
                                                        connection.rollback(function () {
                                                            console.log(err4);
                                                            response.status(400).send('Bad query');
                                                        });

                                                    } else {
                                                        response.json({ package_number: result3[0].pn, current_storage_room: newPackage.current_storage_room, shelf: newPackage.shelf, id: result.insertId });
                                                    }
                                                })


                                            }
                                        })

                                    }

                                })

                            }
                        });
                    }
                });
            }
            connection.release();

        });
    }
});

module.exports = router;