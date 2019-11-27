const express = require('express');
// const { APISUFFIX } = require('../../config').get(process.env.NODE_ENV);

const router = express.Router();


console.log('===============================');
console.log('ENV');
console.log(process.env.NODE_ENV);


// router.use(`${APISUFFIX}/search`, require('./search'));
// router.use(`${APISUFFIX}/storageroom`, require('./storageroom'));
// router.use(`${APISUFFIX}/case`, require('./case'));
// router.use(`${APISUFFIX}/login`, require('./login'));
// router.use(`${APISUFFIX}/logout`, require('./logout'));
// router.use(`${APISUFFIX}/article`, require('./article'));
// router.use(`${APISUFFIX}/branch`, require('./branch'));
// router.use(`${APISUFFIX}/package`, require('./package'));
// router.use(`${APISUFFIX}/shelf`, require('./shelf'));
// router.use(`${APISUFFIX}/storage-event`, require('./storage-event'));


router.use('/search', require('./search'));
router.use('/storageroom', require('./storageroom'));
router.use('/case', require('./case'));
router.use('/login', require('./login'));
router.use('/logout', require('./logout'));
router.use('/article', require('./article'));
router.use('/branch', require('./branch'));
router.use('/package', require('./package'));
router.use('/shelf', require('./shelf'));
router.use('/storage-event', require('./storage-event'));


module.exports = router;
