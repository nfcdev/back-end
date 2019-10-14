const express = require('express');
const router = express.Router();

router.use('/search', require('./search'));
router.use('/case', require('./case'));
router.use('/storage-event', require('./storage-event'));

module.exports = router;