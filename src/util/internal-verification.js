/* eslint-disable no-undef */
/**
 * The purpose of this function is to handle the user in the material tracking system.
 * It is a task separate from verifying that the employee for a given user actually exist.
 */
const pool = require('./connect');

// let sql = 'INSERT INTO `User` (`shortcode`, `role`) VALUES ("' + shortcode + '", "user")';

// let sql = 'SELECT * FROM User WHERE `shortcode` = "' + shortcode + '"';

function queryUser(shortcode, callback) {
    let sql = 'SELECT * FROM User WHERE `shortcode` = "' + shortcode + '"';
    pool.query(sql, (ex, rows) => {
        if (ex) {
            // console.log(ex);
            callback({ code: -1, message: "Error querying DB.", db_error_code: ex })
            return;
        }
        const test = rows.length;
        if (test === 1) {
            callback({ user: rows[0], code: 1 })
        } else if (test > 1) {
            callback({ code: -2, message: "Multiple rows returned from DB. THis should never happen." })
        } else {
            /**
             * Here we know that the user does not exist in 
             * the system and should therefore create it and assign basic rights.
             */
            sql = 'INSERT INTO `User` (`shortcode`, `role`) VALUES ("' + shortcode + '", "user")';
            pool.query(sql, (ex, rows) => {
                if (ex) {
                    console.log(ex);
                    callback({ code: -1, message: "Error creating user.", db_error_code: ex })
                    return;
                }
                queryUser(shortcode, callback);
            })

        }
        return 0;
    });
}


// returns a promise
function verifyUser(userCredentials, callback) {
    const shortcode = userCredentials.name
    queryUser(shortcode, callback)
}

module.exports = verifyUser;