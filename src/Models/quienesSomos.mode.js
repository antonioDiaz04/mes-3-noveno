const mongoose = require("mongoose");

const misionSchema = mongoose.Schema({
  description: {
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
  description: {
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
  title: {
    type: String,
    required: true,
    trim: true
  },
  items: {
    type: [String],
    required: true,
    default: [],
  },
  fechaVigencia: {
    type: Date,
    default: Date.now
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