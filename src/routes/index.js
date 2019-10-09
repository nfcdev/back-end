const express = require('express');
const router = express.Router();

router.use('/search', require('./search'));
router.use('/storageroom', require('./storageroom'));

module.exports = router;