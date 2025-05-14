const Order = require('../models/order');
const User = require('../models/user');
// Crear un nuevo pedido
exports.createOrder = async (req, res) => {
  try {
    const { userId, items, total, direccion } = req.body;

    if (!userId || !items || !total || !direccion) {
      return res.status(400).json({ error: 'Faltan datos obligatorios del pedido' });
    }

    // Evita duplicados
    const haceUnMinuto = new Date(Date.now() - 60000);
    const duplicado = await Order.findOne({
      userId,
      total,
      direccion,
      createdAt: { $gte: haceUnMinuto }
    });

    if (duplicado) {
      return res.status(409).json({ message: 'Pedido duplicado detectado. Ya fue registrado recientemente.' });
    }

    // Crear el pedido
    const newOrder = new Order({
      userId,
      items,
      total,
      direccion
    });

    await newOrder.save();

    // 🧹 Vaciar el carrito del usuario en la base de datos
    await User.findByIdAndUpdate(userId, { carrito: [] });

    res.status(201).json({ message: 'Pedido guardado correctamente', order: newOrder });

  } catch (error) {
    console.error('Error al crear el pedido:', error);
    res.status(500).json({ error: 'Error interno al guardar el pedido' });
  }
};


// Obtener pedidos por usuario
exports.getOrdersByUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const orders = await Order.find({ userId }).sort({ fecha: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error al obtener los pedidos del usuario' });
  }
};
