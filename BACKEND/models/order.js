const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      nombre: String,
      cantidad: Number,
      precio: Number
    }
  ],
  total: Number,
  direccion: String
}, { timestamps: true }); 

module.exports = mongoose.model('Order', OrderSchema);