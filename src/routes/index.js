const express = require('express');
const router = express.Router();

router.use('/search', require('./search'));
router.use('/case', require('./case'));
router.use('/branch', require('./branch'));

module.exports = router;