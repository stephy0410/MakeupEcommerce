const express = require('express');
const router = express.Router();

//Modelo
const Producto = require("../MODELS/producto");

router.get("/producto/nuevo", async(req, res) => {
    try {
        const nuevosProductos = await Producto.find()
            .sort({ fecha: -1 }) // Sort por fecha descendiente
            .limit(6); // Limite de 6 productos
        const count = await Producto.countDocuments();
        console.log('Cantidad de productos:', count);
        res.status(200).json(nuevosProductos);
    } catch (error) {
        console.error(error);
        res.status(400).json({message: 'Error obteniendo los nuevos produtos'});
    }
});



module.exports = router;
