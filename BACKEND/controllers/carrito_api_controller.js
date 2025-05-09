const Product = require('../models/product');
const User = require('../models/user');

// READ - GET /products/:id
exports.showCartProducts = async function (req, res) {
    try {
        // Id del usuario
        const user_id = req.params._id;
        
        // Encontrar al usuario
        const user = await User.findById(user_id);
        if(!user) {
            return res.status(404).json({error: "Usuario no encontrado..."});
        }

        // Array del carrito del usuario
        const user_carrito = user.carrito || [];

        // Si el carrito no tiene nada no devuelve nada
        if(user_carrito == 0) {
            return res.json([]);
        }

        // Id del producto
        const prod_id = user_carrito.map(item => item.producto);
        const prods = await Product.find({_id: {$in: prod_id}});

        const prod_canti = prods.map(prod => {
            // Si hay algun producto, entonces se agregan sus datos a la carta
            const item = user_carrito.find(item => item.producto.toString() == prod._id.toString());
            return {
                _id: prod._id,
                name: prod.name,
                description: prod.description,
                price: prod.price,
                image: prod.image,
                // La cantidad por default es 1
                cantidad: item ? item.cantidad : 1
            };
        })

        res.json(prod_canti);
    }
    
    catch (err) {
        console.error("Error en showCartProducts: ", err.message);
        res.status(500).json({error: 'Error al obtener los productos'})
    }
}