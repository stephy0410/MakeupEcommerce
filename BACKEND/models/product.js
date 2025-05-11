const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  tag: {
    type: String,
    required: [true, 'La etiqueta es obligatoria'],
    enum: ['Blush', 'Rimel', 'Primer', 'Labial']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'El descuento no puede ser negativo'],
    max: [100, 'El descuento no puede ser mayor a 100%']
  },
  image: {
    type: String,
    required: [true, 'La URL de la imagen es obligatoria'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Método para calcular el precio final con descuento
productSchema.methods.getFinalPrice = function() {
  return this.price * (1 - this.discount / 100);
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;