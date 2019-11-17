const express = require('express');

const router = express.Router();

router.use('/search', require('./search'));
<<<<<<< HEAD
router.use('/article', require('./article'));
=======
router.use('/storageroom', require('./storageroom'));
>>>>>>> f3afbd880b52f5d20d7029a9c7e41cf445caa6dc
router.use('/case', require('./case'));
router.use('/login', require('./login'));
router.use('/logout', require('./logout'));
router.use('/article', require('./article'));
router.use('/branch', require('./branch'));
router.use('/package', require('./package'));
router.use('/shelf', require('./shelf'));

module.exports = router;
