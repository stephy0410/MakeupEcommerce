const express = require('express');
const routerAdmin = express.Router();
const AdminController = require('../controllers/admin_api_controller');

// Rutas para productos
routerAdmin.post('/products', AdminController.createProduct); 
routerAdmin.get('/products', AdminController.getAllProducts);
routerAdmin.get('/products/:id', AdminController.authProductMiddleware, AdminController.getProductById);
routerAdmin.patch('/products/:id', AdminController.authProductMiddleware, AdminController.updateProduct);
routerAdmin.delete('/products/:id', AdminController.authProductMiddleware, AdminController.deleteProduct);

module.exports = routerAdmin;