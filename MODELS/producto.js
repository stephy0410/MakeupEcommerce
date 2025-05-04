const mongoose = require('mongoose');

let productoSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        max: 200,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    categoria: {
        type: String,
        enum: ['Blush', 'Labial', 'Primer', 'Rimel'],
        required: true
    },
    favorito: {
        type: Boolean,
        default: false
    },
    imagen: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Producto', productoSchema);




