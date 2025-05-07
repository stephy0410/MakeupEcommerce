const Product = require('../models/product');

exports.getFilteredProducts = async function(req, res) {
    const {tag} = req.query;
    console.log('Tag recibido:', tag);

    try{
        const products = await Product.find({tag: tag});
        console.log('Productos encontrados:', products);
        res.json(products);
    } catch (err) {
        console.error('Error al obtener productos por tag:', err);
        res.status(500).json({ error: 'Error al obtener los productos por tag' });
    }
}
