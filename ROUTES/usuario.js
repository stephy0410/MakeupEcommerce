const express = require('express');
const router = express.Router();

//Modelo
const Cliente = require("../MODELS/cliente");
const Producto = require("../MODELS/producto");

router.get('/cliente/favoritos/:clienteId', async(req, res) => {
    try{
        const clienteId = req.params.clienteId; 

        const cliente = await Cliente.findById(clienteId).select('favoritos');
        const productIds = cliente.favoritos;
        const productos = await Producto.find({ _id: { $in: productIds } });
        const count = await Cliente.countDocuments();
        console.log('Cantidad de clientes:', count);
        res.status(200).json(productos);
    }catch(error){
        console.error(error);
        res.status(400).json({message: 'Error obteniendo los produtos favoritos'});
    }
});

module.exports = router;