// controllers/admin_api_controller.js
const Product = require('../models/product');
const User = require('../models/user');
const sessions = require('./users_api_controller').sessions;

// CREATE - POST /products
exports.createProduct = async function (req, res) {
    try {
      const { name, price, tag, discount = 0, image, description = '' } = req.body;
      if (!name || !price || !tag || !image) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: name, price, tag, image' });
      }
  
      const product = new Product({ name, price, tag, discount, image, description });
      const savedProduct = await product.save();
      res.status(201).json({ message: "Producto creado con éxito", data: savedProduct });
  
    } catch (err) {
      res.status(500).json({ error: err.message || 'Error al guardar el producto' });
    }
  };
  

// READ - GET /products
exports.getAllProducts = async function (req, res) {
  try {
      let query = {};
      if (req.query.search) {
          query.name = { $regex: req.query.search, $options: 'i' };
      }
      const products = await Product.find(query).sort({ createdAt: -1 });
      res.status(200).json({ data: products });
  } catch (err) {
      res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

// Middleware para validar producto
exports.authProductMiddleware = async function (req, res, next) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: `Producto con ID ${req.params.id} no encontrado` });
      req.product = product;
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Error al buscar el producto' });
    }
  };

// GET /products/:id
exports.getProductById = function(req, res) {
  res.json({ data: req.product });
};

// UPDATE - PATCH /products/:id
exports.updateProduct = async function (req, res) {
    try {
      const updates = req.body;
      const allowedUpdates = ['name', 'price', 'tag', 'discount', 'image', 'description'];
      const isValidOperation = Object.keys(updates).every(update => allowedUpdates.includes(update));
  
      if (!isValidOperation) return res.status(400).json({ error: "Campos de actualización no válidos" });
  
      Object.assign(req.product, updates);
      const updatedProduct = await req.product.save();
  
      res.json({ message: "Producto actualizado con éxito", data: updatedProduct });
    } catch (err) {
      res.status(400).json({ error: 'Error actualizando producto' });
    }
  };
  
  exports.deleteProduct = async function (req, res) {
    try {
      await req.product.deleteOne();
      res.json({ message: 'Producto eliminado con éxito', data: req.product });
    } catch (err) {
      res.status(400).json({ error: 'Error al eliminar el producto' });
    }
  };
  