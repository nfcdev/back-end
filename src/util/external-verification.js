/* eslint-disable no-undef */


/**
 * Here a function call to the external employee register most be implemented. For now
 * status code 1 (=ok) is returned.
 */

const verifyEmployee = function (user) {
    console.log("\n\n---Internal verification---");
    console.log("user object", user);
    console.log("-------------\n\n");
    return 1;
}

module.exports = verifyEmployee;
