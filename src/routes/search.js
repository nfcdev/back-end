const express = require('express');
const router = express.Router();


router.get('/', (request, response) => {
    console.log('123');
    response.send('hello');
});


module.exports = router;