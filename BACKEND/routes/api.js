
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin_api_controller');

// Listar productos
router.get('/products', adminController.getAllProducts);
router.post('/products', adminController.createProduct);
router.get('/products/:id', adminController.authProductMiddleware, adminController.getProductById);
router.patch('/products/:id', adminController.authProductMiddleware, adminController.updateProduct);
router.delete('/products/:id', adminController.authProductMiddleware, adminController.deleteProduct);

module.exports = router;
