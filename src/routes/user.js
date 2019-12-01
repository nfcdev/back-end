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

const makeDb = () => new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => (
        resolve({
            query(sql, args) {
                return util.promisify(connection.query)
                    .call(connection, sql, args);
            },
            close() {
                return util.promisify(connection.release).call(connection);
            },
            beginTransaction() {
                return util.promisify(connection.beginTransaction)
                    .call(connection);
            },
            commit() {
                return util.promisify(connection.commit)
                    .call(connection);
            },
            rollback() {
                return util.promisify(connection.rollback)
                    .call(connection);
            },
        })
    ));
});

router.get('/material', authenticatedRequest, async (request, response) => {
    const db = await makeDb();
    let japp = [];
    db.beginTransaction()
        .then(() => {
            let a = db.query('SELECT id FROM Article_information WHERE status = "checked_out"');
            let b = db.query('SELECT * FROM Article_information WHERE status = "checked_out" ORDER BY id ASC');
            return Promise.all([a, b])
        })
        .then((materials) => {
            
            let c = db.query('SELECT * FROM StorageEvent WHERE article IN (SELECT id FROM Article_information WHERE status = "checked_out") ORDER BY article ASC, timestamp DESC');
            return Promise.all([c, materials[1]]);
        })
        .then((eventArticles) => {
            let a = 0;
            let d = eventArticles[0];
            let e = eventArticles[1];
            let f = [];
            
            
            while(a < d.length){
                //console.log(a);
                if(a != d.length-1){
                    //console.log(d[a]);
                    let x = a++;
                    //console.log(d[x]);
                   
                if(d[a].article == d[x].article){
                    d.splice(x, 1);
                    a = 0;
                } else {
                    a++;
                }
                
            } else {
                a++;
            }
            //console.log(a);
            //console.log(d.length);
            }
            console.log("d: " + d.length)
            console.log("e: " + e.length)
            /*for (a in e){
                if (d[a].article == e[a].article && d[a].user == request.user.shortcode ){
                    f.push(e[a]);
                }
            }*/
            for (z in d){
                console.log(request.user.shortcode);
                if(d[z].user == request.user.shortcode){
                    f.push(d[z]);
                    console.log(f);
                }
            }
            return Promise.all([f, e]);
        })
        .then((g) => {
            
            for (z in g[1]){
                
                for( y in g[0]){
                    console.log("hejsan");
                    if(g[0][y].id == g[1][z].article){
                    japp.push(g[0][y]);
                    console.log(japp);
                    }
                }
            }
            return Promise.all([japp]);
        })
        .then((abc) => {
            db.commit();
            db.close();
            response.send(abc[0]);
        })
        .catch((err) => {
            console.log(err);
            db.rollback();
            db.close();
            response.status(400).json({ error: err.message });
        });

});


router.get('/test', authenticatedRequest, (request, response) => {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.log(err);
            response.status(500).send('Cannot connect to server');
        } else {
            const sql = '(SELECT material_number FROM Article_information WHERE id IN (SELECT article FROM StorageEvent WHERE user = "Jesper")) INTERSECT (SELECT material_number FROM Article_information WHERE status = "checked_out")';
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

module.exports = router;