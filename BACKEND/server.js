const express = require('express');
const path = require('path');
const connectDB = require('./database/db');
const apiRoutes = require('./routes/api');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, '../FRONTEND')));

// Rutas para las páginas HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/views/Login.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/views/Login.html'));
});

// Nueva ruta para Home.html
app.get('/Home.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/views/Home.html'));
});
app.get('/Admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/views/Admin.html'));
});


// Routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));