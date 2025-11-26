const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_KEY); 

exports.createPaymentIntent = async (req, res) => {
  try {
    const { items, total } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'mxn',
          product_data: {
            name: item.nombre,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.cantidad,
      })),
      mode: 'payment',
      success_url: 'http://localhost:3000/Home.html?success=true',
      cancel_url: 'http://localhost:3000/Carrito.html?cancelled=true',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creando sesión de Stripe:', error);
    res.status(500).json({ error: 'Error al crear sesión de pago' });
  }
};
