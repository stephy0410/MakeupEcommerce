const express = require('express');
const path = require('path');
const connectDB = require('./database/db');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin'); // Añade esta línea
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/users');

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, '../FRONTEND')));
// Middleware para proteger rutas HTML si no hay sesión
const pathRequiresAuth = ['/Admin.html'];

app.use((req, res, next) => {
    if (pathRequiresAuth.includes(req.path)) {
        const sessionId = req.headers['authorization'] || req.query.auth;

        if (!sessionId) {
            // Si no hay token en la solicitud, verificar si el frontend ya está autenticado
            const userFromFrontend = req.headers['x-user-auth']; // Opcional: puedes usar cookies en lugar de headers
            if (!userFromFrontend) {
                // Si el frontend no está autenticado, redirigir a login
                return res.redirect('/login.html');
            }
            // Si el frontend está autenticado, permitir el acceso
            next();
        } else {
            // Validar el token del backend
            const User = require('./models/user');
            User.findById(sessionId)
                .then(user => {
                    if (!user) return res.redirect('/login.html');
                    next();
                })
                .catch(() => res.redirect('/login.html'));
        }
    } else {
        next();
    }
});


// Rutas para las páginas HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/views/Login.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/views/Login.html'));
});

app.get('/Home.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/views/Home.html'));
});

app.get('/Admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/views/Admin.html'));
});

// Routes
app.use('/api', apiRoutes);
app.use('/api/users', userRoutes);
app.use('/admin', adminRoutes); // Añade esta línea

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));