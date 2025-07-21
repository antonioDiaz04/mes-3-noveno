const mongoose = require("mongoose");

const EstadoCuentaSchema = mongoose.Schema({
  estado: { type: String, default: "activa" },
  intentosFallidos: { type: Number, required: true, default: 0 },
  fechaUltimoIntentoFallido: { type: Date },
  vecesDeBloqueos: { type: Number, default: 0 },
  fechaDeUltimoBloqueo: { type: Date },
  intentosPermitidos: { type: Number, default: 5 },
  tiempoDeBloqueo: { type: Number, default: 30 },
});

const DispositivoWearSchema = mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuarios", required: true },
  fechaVinculacion: { type: Date, default: Date.now },
  estado: { type: String, default: "vinculado" },
  preferencias: {
    notificaciones: { type: Boolean, default: true },
    vibracion: { type: Boolean, default: true },
    tema: { type: String, enum: ["claro", "oscuro", "sistema"], default: "sistema" },
    idioma: { type: String, default: "es" },
  },
});

const UsuarioSchema = mongoose.Schema({
  fotoDePerfil: { type: String },
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  edad: { type: Number },
  direccion: { type: String },
  email: { type: String, unique: true, required: false },
  telefono: { type: String, required: true },
  token: { type: String, required: false },
  tokenAlexa: { type: String, required: false },
  codigoVerificacion: { type: String, required: false },
  verificado: { type: Boolean, required: false },
  rol: { type: String, required: false, default: "CLIENTE" },
  password: { type: String, required: false, default: "" },
  fechaDeRegistro: { type: Date, default: Date.now() },
  isClienteFrecuente: { type: Boolean, required: false, default: false },
  isNuevo: { type: Boolean, required: false, default: true },
  ultimaConexion: { type: Date },
  estadoCuenta: { type: mongoose.Schema.Types.ObjectId, ref: "EstadoCuenta" },
  dispositivoWear: { type: mongoose.Schema.Types.ObjectId, ref: "DispositivoWear" },
});

//  Middleware pre-save para limpiar el número de teléfono
UsuarioSchema.pre("save", function (next) {
  if (this.telefono) {
    this.telefono = this.telefono.replace(/\s+/g, "");
  }
  next();
});


const EstadoCuenta = mongoose.model("EstadoCuenta", EstadoCuentaSchema);
const DispositivoWear = mongoose.model("DispositivoWear", DispositivoWearSchema);
const Usuario = mongoose.model("Usuarios", UsuarioSchema);

module.exports = {
  Usuario,
  DispositivoWear,
  EstadoCuenta,
};
