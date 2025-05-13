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
                role: 'user',
                favoritos: [],
                carrito: []
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
                    role: user.role,
                    favoritos: [],
                    carrito: []
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
                    role: user.role,
                    favoritos: user.favoritos,
                    carrito: user.carrito
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
exports.updateCurrentUser = async function (req, res) {
    try {
        const userId = req.params.id;
        const { username, email, password } = req.body;

        const updatedData = {};
        if (username) updatedData.username = username;
        if (email) updatedData.email = email;
        if (password) updatedData.password = password;
        

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updatedData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Solo devolvemos los datos visibles, NO role si no lo necesitas
        res.json({
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role  // Puedes quitar esto si no lo usas en frontend
        });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error al actualizar el usuario' });
    }
};
exports.deleteCurrentUser = async function (req, res) {
    try {
        const userId = req.headers['authorization'];
        await User.findByIdAndDelete(userId);
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error al eliminar el usuario' });
    }
};

exports.favorites = async function (req, res){
    const { userID, productID } = req.params;

    try {
        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        const index = user.favoritos.indexOf(productID);
        if (index > -1) {
            // Si ya esta lo quitamos
            user.favoritos.splice(index, 1);
        } else {
            // Si no esta lo agregamos
            user.favoritos.push(productID);
        }

        await user.save();
        res.json(user.favoritos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos favoritos' });
    }

}

exports.cart = async function (req, res) {
    const { userID, productID } = req.params;

    try {
        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        const index = user.carrito.findIndex(item => item.producto === productID);
        if (index > -1) {
            // Si ya está, lo quitamos
            user.carrito.splice(index, 1);
        } else {
            // Si no está, lo agregamos
            user.carrito.push({ producto: productID, cantidad: 1 });
        }

        await user.save();
        res.json(user.carrito);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el carrito' });
    }
};

exports.updateCart = async function (req, res) {
    // Parametros a actualizar del usuario
    const { id } = req.params;
    const { carrito } = req.body;

    try {
        // Encontramos el usuario mediante su id
        const user = await User.findById(id);

        if(!user) {
            return res.status(404).json({error: "Usuario no encontrado"})
        }

        // Se guardan los datos actualizados
        user.carrito = carrito;
        await user.save();

        res.json(user.carrito);
    }

    catch(err) {
        console.error(err);
        res.status(500).json({error: "Error al actualizar el carrito"});
    }
}