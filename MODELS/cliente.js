const mongoose = require('mongoose');

let usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    favoritos: {
        type: [String],
        required: true
    }
});

module.exports = mongoose.model('Usuarios', usuarioSchema);




