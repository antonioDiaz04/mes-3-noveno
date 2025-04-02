const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true, // Requerido
    trim: true,
  },
  talla: {
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
  textura: {
    type: String,
    required: false, // Puede ser opcional
  },

  talla: {
    type: String,
    enum: ["XS", "S", "M", "L", "XL", "XXL", "Otro"],
    required: false,
  },
  medidas: {
    altura: { type: Number, required: false }, // en cm
    cintura: { type: Number, required: false }, // en cm
  },
  precio: {
    type: Number,
    required: true, // Requerido
    min: 0, // Precio no puede ser negativo
  },
  opcionesTipoTransaccion: {
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
  imagenes: {
    type: [String],
    default: [], // Valor por defecto
  },
  fechaCreacion: {
    type: Date,
    required: true,
    default: Date.now, // Valor por defecto
  },
  idCategoria: { // Relación con la categoría
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categoria", // Referencia al modelo de categoría
    required: true, // Requerido
  },
});

module.exports = mongoose.model("Producto", productoSchema);