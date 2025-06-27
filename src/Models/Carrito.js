const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
  id: String,
  nombre: String,
  precio: Number,
  imagenes: String,
  opcionesTipoTransaccion: String,
}, { _id: false });

const CarritoSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  productos: [ProductoSchema],
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Carrito', CarritoSchema);
