const mongoose = require("mongoose");

const UsuarioSchema = mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, unique: true, required: false },
  telefono: { type: String, required: true },
  token: { type: String, required: false },
  codigoVerificacion: { type: String, required: false },
  verificado: { type: Boolean, required: false },
  rol: { type: String, required: false, default: "cliente" },
  password: { type: String, required: false, default: "" },
  fechaDeRegistro: { type: Date, default: Date.now() },
});

//  Middleware pre-save para limpiar el número de teléfono
UsuarioSchema.pre("save", function (next) {
  if (this.telefono) {
    // Remover espacios del número de teléfono
    this.telefono = this.telefono.replace(/\s+/g, "");
  }
  next();
});
module.exports = {
  Usuario: mongoose.model("Usuarios", UsuarioSchema),
};
