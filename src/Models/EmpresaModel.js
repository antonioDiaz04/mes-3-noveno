const mongoose = require("mongoose");

const DatosAtelierSchema = new mongoose.Schema({
  logo: {
    type: String,
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  redesSociales: [
    {
      plataforma: {
        type: String,
        required: true,
      },
      enlace: {
        type: String,
        required: true,
      },
    },
  ],
  slogan: {
    type: String,
    maxlength: 100,
  },
  tituloPagina: {
    type: String,
    maxlength: 60,
  },
  direccion: {
    type: String,
    required: true,
  },
  correoElectronico: {
    type: String,
    required: true,
  },
  telefono: {
    type: String,
  },
<<<<<<< HEAD
});

const redesSocialesSchema = mongoose.Schema([
  {
    plataforma: {
      type: String,
      required: true,
    },
    enlace: {
      type: String,
      required: true,
    }
=======
  // ✅ Agregamos Misión, Visión y Valores dentro del mismo modelo
  mision: {
    titulo: { type: String, required: true },
    contenido: { type: String, required: true },
>>>>>>> b3af643d4314dc37444a2d084b1186988b2d9c61
  },
  vision: {
    titulo: { type: String, required: true },
    contenido: { type: String, required: true },
  },
  valores: {
    titulo: { type: String, required: true },
    contenido: { type: String, required: true },
  },
});

module.exports = mongoose.model("DatosAtelier", DatosAtelierSchema);
