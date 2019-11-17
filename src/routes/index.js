const express = require('express');

const router = express.Router();

router.use('/search', require('./search'));
router.use('/article', require('./article'));
router.use('/case', require('./case'));

module.exports = router;
