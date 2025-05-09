const Product = require('../models/product');
const User = require('../models/user');



// READ - GET /products/news
exports.getNewProducts = async function (req, res) {
    try {
        
        const newProducts = await Product.find()
            .sort({ createdAt: -1 }) // Sort por fecha descendente
            .limit(6); // Limite de 6 productos
        res.status(200).json(newProducts);
    } catch (err) {
        console.error("Error en getNewProducts:", err.message); 
      res.status(500).json({ error: 'Error al obtener los productos' });
    }
};

// READ - GET /products/favorites
exports.getFavoriteProducts = async function (req, res) {
    const { ids } = req.body;
    try {
        const products = await Product.find({ _id: { $in: ids } });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener productos favoritos' });
    }
};

