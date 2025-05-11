// Controlador de las rutas para usar stripe
const Stripe = require('stripe');

exports.createPaymentIntent = async (req, res) => {
    try {
        const { total, items = [] } = req.body;

        // Si no hay items en el carrito...
        if(!total || total.length <= 0) {
            return res.status(400).json({error: "El carrito está vacío"});
        }

        // Items que va a tener la pagina de Stripe
        const modal_items = items.map(item => {
            return {
                price_data: {
                    // Moneda a usar
                    currency: 'mxn',
                    // Datos de los productos
                    products: {
                        name: item.nombre,
                        images: item.imagen ? [item.imagen] : [],
                        descripcion: `ID: ${item.id}`,
                    },
                    precio_product: Math.round(item.price * 100)
                },
                cantidad: item.cantidad,
            };
        });  

        // Sesion de Stripe Checkout
        const stripe_session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            sucess_url: `${req.headers.origins}../../FRONTEND/views/Pedidos.html`,
            cancel_url: `${req.headers.origins}../../FRONTEND/views/Carrito.html`,
            // Paises permitidos para el envio
            shipp_add: {
                allowed: ['MX'],
            },
            // Muestra todo en español
            bill_add: 'required',
            local: 'es',
            // Output en la tarjeta de la persona
            payment_card: {
                card: {
                    shop_desc: 'ROSEE MAKEUP'
                }
            }
        });

        // AQUI VA LO DE GUARDAR EN LA BASE DE DATOS
    }

    catch (err) {
        console.err("Error al crear la sesión en Stripe:", err);
        res.status(500).json({error: "Error al procesar el pago"});
    }
};