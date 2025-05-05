const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users_api_controller');

// Register
router.post('/register', usersController.register);

// Login
router.post('/login', usersController.login);

// Get all users (admin only)
router.get('/', usersController.requireAuth, usersController.requireAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Update user role (admin only)
router.put('/:id/role', usersController.requireAuth, usersController.requireAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role' });
    }
});
router.patch('/me', usersController.updateCurrentUser);  // Editar usuario actual
router.delete('/me', usersController.deleteCurrentUser); // Eliminar usuario actual

module.exports = router;