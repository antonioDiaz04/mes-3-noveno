const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  fechaDeCreacion: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Categoria', CategoriaSchema);