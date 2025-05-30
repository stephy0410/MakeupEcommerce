const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    }, 
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    favoritos:{
        type:[String],
        default: []
    }, 
    carrito: {
        type: [{
            producto: {
                type: String,
            },
            cantidad: {
                type: Number,
                default: 1
            }
        }],
        default: []
    }
});

module.exports = mongoose.model('User', userSchema);