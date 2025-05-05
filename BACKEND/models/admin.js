const mongoose = require('mongoose');
const userSchema = require('./user');

const adminSchema = new mongoose.Schema({
  ...userSchema.obj,
  adminPermissions: {
    type: [String],
    default: ['manage_products', 'manage_users']
  }
});

module.exports = mongoose.model('Admin', adminSchema);