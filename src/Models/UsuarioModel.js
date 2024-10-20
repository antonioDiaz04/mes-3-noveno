const mongoose = require("mongoose");

const EstadoCuentaSchema = mongoose.Schema({
  estado: { type: String, default: "activa" },
  intentosFallidos: { type: Number, required: true, default: 0 },
  fechaUltimoIntentoFallido: { type: Date },
  vecesDeBloqueos: { type: Number, default: 0 },
  fechaDeUltimoBloqueo: { type: Date },
  tiempoDeBloqueo: { type: Date }
});

const UsuarioSchema = mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, unique: true, required: false },
  telefono: { type: String, required: true },
  token: { type: String, required: false },
  rol: { type: String, required: false, default: "cliente" },
  password: { type: String, required: false, default: "" },
  fechaDeRegistro: { type: Date, default: Date.now() },
  estadoCuenta: { type: mongoose.Schema.Types.ObjectId, ref: "EstadoCuenta" }, 
});

const EstadoCuenta = mongoose.model("EstadoCuenta", EstadoCuentaSchema);
const Usuario = mongoose.model("Usuarios", UsuarioSchema);

module.exports = {
  Usuario,
  EstadoCuenta,
};