const User = require('../models/user');

exports.protect = (req, res, next) => {
    const sessionId = req.headers['authorization'];
    
    if (!sessionId) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    User.findById(sessionId)
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Not authenticated' });
            }
            req.user = user;
            next();
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        });
};

exports.admin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};
