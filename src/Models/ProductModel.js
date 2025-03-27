const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true, // Requerido
    trim: true,
  },
  talla: { // Cambiado de "talla" a "tallaDisponible"
    type: String,
    required: true, // Requerido
  },
  altura: {
    type: Number,
    required: true, // Requerido
  },
  cintura: {
    type: Number,
    required: true, // Requerido
  },
  color: {
    type: String,
    required: true, // Requerido
  },
  precio: {
    type: Number,
    required: true, // Requerido
    min: 0, // Precio no puede ser negativo
  },
  opcionesTipoTransaccion: { // Cambiado de "tipoVenta" a "opcionesTipoTransaccion"
    type: String,
    required: true, // Requerido
    default: "Venta", // Valor por defecto
  },
  nuevo: {
    type: Boolean,
    required: true, // Requerido
    default: true, // Valor por defecto
  },
  disponible: {
    type: Boolean,
    required: false, // Requerido
    default: true, // Valor por defecto
  },
  tipoCuello: {
    type: String,
    required: true, // Requerido
  },
  tipoCola: {
    type: String,
    required: true, // Requerido
  },
  tipoCapas: {
    type: String,
    required: true, // Requerido
  },
  tipoHombro: {
    type: String,
    required: true, // Requerido
  },
  descripcion: {
    type: String,
    required: false, // Opcional
    trim: true,
  },
  imagenes: { // Array de imágenes
    type: [String],
    default: [], // Valor por defecto
  },
  fechaCreacion: { // Fecha de creación del producto
    type: Date,
    required: true,
    default: Date.now, // Valor por defecto
  },
});

module.exports = mongoose.model("Producto", productoSchema);