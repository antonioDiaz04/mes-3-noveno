const mongoose = require('mongoose');

const accesorioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: false,
    trim: true
  },
  imagenPrincipal: {
    type: String,
    required: true
  },
  estado: {
    disponible: {
      type: Boolean,
      required: false,
      default: true
    }
  }
});

module.exports = mongoose.model('Accesorio', accesorioSchema);
