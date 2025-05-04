const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors({
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));

app.use(express.static(path.join(__dirname, 'FRONTEND/Views')));
app.use('/js', express.static(path.join(__dirname, 'FRONTEND/js')));

//Rutas
app.use(require("./ROUTES/maquillaje"));

//Base de datos
let mongoConnection = "mongodb+srv://yanaelinagarcia:Sesamo00@cluster0.ukb7l2l.mongodb.net/MakeupECommerce"
let db = mongoose.connection;
db.on('connecting', () => { 
    console.log('Conectando...');
    console.log(mongoose.connection.readyState); 
});
db.on('connected', () => {
    console.log('¡Conectado exitosamente!');
    console.log(mongoose.connection.readyState);
});
mongoose.connect(mongoConnection);

app.listen(port, () => {
    console.log(`MakeupECommerce corriendo en puerto ${port}`);
});