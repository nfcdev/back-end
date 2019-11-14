const express = require('express');

const router = express.Router();

router.use('/search', require('./search'));
router.use('/storageroom', require('./storageroom'));
router.use('/case', require('./case'));
router.use('/login', require('./login'));
router.use('/logout', require('./logout'));
router.use('/article', require('./article'));
router.use('/branch', require('./branch'));
router.use('/package', require('./package'));
<<<<<<< HEAD
=======

>>>>>>> 5bd264810e814b1619bccfda8a11d9bb6dff3583
module.exports = router;
