const mongoose = require("mongoose");

const misionSchema = mongoose.Schema({
  contenido: {
    type: String,
    required: true,
    trim: true
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  }
});

const visionSchema = mongoose.Schema({
  contenido: {
    type: String,
    required: true,
    trim: true
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  }
});

const valoresSchema = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  icono: {
    type: String,
    trim: true
  },
  orden: {
    type: Number,
    default: 0
  },
  activo: {
    type: Boolean,
    default: true
  }
});

const preguntasFrecuentesSchema = mongoose.Schema({
  pregunta: {
    type: String,
    required: true,
    trim: true
  },
  respuesta: {
    type: String,
    required: true,
    trim: true
  },
  categoria: {
    type: String,
    trim: true
  },
  orden: {
    type: Number,
    default: 0
  },
  activo: {
    type: Boolean,
    default: true
  }
});

// Crear los modelos
const Mision = mongoose.model("Mision", misionSchema);
const Vision = mongoose.model("Vision", visionSchema);
const Valores = mongoose.model("Valores", valoresSchema);
const PreguntaFrecuente = mongoose.model("PreguntaFrecuente", preguntasFrecuentesSchema);

module.exports = {
  Mision,
  Vision,
  Valores,
  PreguntaFrecuente
};