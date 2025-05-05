const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin_api_controller');
const { protect, admin } = require('../middleware/auth');

router.get('/users', protect, admin, adminController.getAllUsers);
router.put('/users/:userId/role', protect, admin, adminController.updateUserRole);

module.exports = router;