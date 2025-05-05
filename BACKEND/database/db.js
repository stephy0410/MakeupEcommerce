// db.js
const mongoose = require('mongoose');

const mongoConnection = "mongodb+srv://stephy04:Brownie5@cluster0.0ycletr.mongodb.net/MakeupEcommerceDB";
const db = mongoose.connection;

db.on('connecting', () => { 
    console.log('Conectando...');
    console.log(mongoose.connection.readyState); //State 2: Connecting
});
db.on('connected', () => {
    console.log('¡Conectado exitosamente!');
    console.log(mongoose.connection.readyState); //State 1: Connected
});

const connectDB = async () => {
    try {
        await mongoose.connect(mongoConnection);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;