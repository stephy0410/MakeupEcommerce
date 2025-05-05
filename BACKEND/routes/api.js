const express = require('express');
const router = express.Router();
const usersRouter = require('./users');
const adminRouter = require('./admin');

router.use('/users', usersRouter);
router.use('/admin', adminRouter);

module.exports = router;