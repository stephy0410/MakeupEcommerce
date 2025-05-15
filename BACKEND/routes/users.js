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
router.patch('/users/:id', usersController.updateCurrentUser);          // para editar perfil
router.patch('/users/:id/carrito', usersController.updateCart);         // para actualizar carrito
router.delete('/me', usersController.deleteCurrentUser); // Eliminar usuario actual

router.post('/users/:userID/favs/:productID', usersController.favorites); //yo
router.post('/users/:userID/carrito/:productID', usersController.cart); //yo
router.delete('/users/:userID/carrito/:productID', usersController.removeFromCart);

module.exports = router;