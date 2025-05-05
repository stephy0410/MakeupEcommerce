const User = require('../models/user');
const sessions = {};

exports.register = function(req, res) {
    const { username, email, password, confirmPassword } = req.body;

    if (!password || password !== confirmPassword) {
        return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }

    User.findOne({ $or: [{ email }, { username }] })
        .then(function(existingUser) {
            if (existingUser) {
                return res.status(400).json({ message: 'El usuario ya existe' });
            }

            const user = new User({ 
                username, 
                email, 
                password,  
                role: 'user'
            });
            
            return user.save();
        })
        .then(function(user) {
            const sessionId = Math.random().toString(36).substring(2);
            sessions[sessionId] = user._id;
            
            res.json({ 
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                sessionId 
            });
        })
        .catch(function(error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        });
};

exports.login = function(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username y contraseña son requeridos' });
    }

    User.findOne({ username })
        .then(function(user) {
            if (!user || user.password !== password) {
                return res.status(401).json({ message: 'Credenciales incorrectas' });
            }

            const sessionId = Math.random().toString(36).substring(2);
            sessions[sessionId] = user._id;
            
            res.json({ 
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                sessionId 
            });
        })
        .catch(function(error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        });
};

// Middleware para rutas protegidas
exports.requireAuth = function(req, res, next) {
    const sessionId = req.headers['authorization'];
    
    if (!sessionId || !sessions[sessionId]) {
        return res.status(401).json({ message: 'No autenticado' });
    }
    
    req.userId = sessions[sessionId];
    next();
};

exports.requireAdmin = function(req, res, next) {
    const sessionId = req.headers['authorization'];
    
    if (!sessionId || !sessions[sessionId]) {
        return res.status(401).json({ message: 'No autenticado' });
    }
    
    User.findById(sessions[sessionId])
        .then(function(user) {
            if (!user || user.role !== 'admin') {
                return res.status(403).json({ message: 'Se requiere acceso de administrador' });
            }
            next();
        })
        .catch(function(error) {
            console.error('Admin check error:', error);
            res.status(500).json({ message: 'Error en el servidor' });
        });
};