const express = require('express');
const { APISUFFIX } = require('../../config').get(process.env.NODE_ENV);

const router = express.Router();

router.use(`${APISUFFIX}/storageroom`, require('./storageroom'));
router.use(`${APISUFFIX}/case`, require('./case'));
router.use(`${APISUFFIX}/login`, require('./login'));
router.use(`${APISUFFIX}/logout`, require('./logout'));
router.use(`${APISUFFIX}/article`, require('./article'));
router.use(`${APISUFFIX}/branch`, require('./branch'));
router.use(`${APISUFFIX}/package`, require('./package'));
router.use(`${APISUFFIX}/shelf`, require('./shelf'));
router.use(`${APISUFFIX}/storage-event`, require('./storage-event'));
router.use(`${APISUFFIX}/user`, require('./user'));


module.exports = router;
