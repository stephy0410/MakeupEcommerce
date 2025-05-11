
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin_api_controller');
const homeController = require('../controllers/home_api_controller');
const userController = require('../controllers/users_api_controller');
const filterController = require('../controllers/filter_api_controller');
const carritoController = require('../controllers/carrito_api_controller');

// Listar productos
router.get('/products', adminController.getAllProducts);
router.post('/products', adminController.createProduct);
router.get('/products/news', homeController.getNewProducts); //yo
router.post('/products/favorites', homeController.getFavoriteProducts); //yo
router.get('/products/filter', filterController.getFilteredProducts); //yo
router.get('/products/:id', adminController.authProductMiddleware, adminController.getProductById);
router.patch('/products/:id', adminController.authProductMiddleware, adminController.updateProduct);
router.delete('/products/:id', adminController.authProductMiddleware, adminController.deleteProduct);

router.get('/products/:id', carritoController.showCartProducts);
router.patch('/users/:id', userController.updateCart);

module.exports = router;
