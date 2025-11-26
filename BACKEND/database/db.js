// db.js
const mongoose = require('mongoose');



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
        
        const mongoConnection = process.env.MONGO_URI;
        
        if (!mongoConnection) {
            throw new Error('MONGO_URI no está definida en las variables de entorno');
        }
        
        console.log('Iniciando conexión a MongoDB...');
        await mongoose.connect(mongoConnection);
    } catch (err) {
        console.error('✗ Error de conexión a MongoDB:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;