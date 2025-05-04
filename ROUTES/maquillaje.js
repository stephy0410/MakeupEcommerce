const express = require('express');
const router = express.Router();
const maquillajeController = require('../BACKEND/CONTROLLERS/home');  

router.get('/maquillaje/nuevo', maquillajeController.getNuevosProductos);

module.exports = router;