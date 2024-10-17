const mongoose = require("mongoose");

const UsuarioSchema = mongoose.Schema({
  idPurificadora: { type: mongoose.Schema.Types.ObjectId, ref: "Purificadoras" },

  nombre: {type: String,required: true},
  email: {type: String,unique: true,required: false,},
  longitud: {type: String},
  latitud: {type: String,},
  telefono: {type: String,required: true},
  numCasa: {type: String,required: false},
  municipio: {type: String,required: true},
  colonia: {type: String,required: true},
  estatus: {type: String,required: false,default: "Activo"},
  token: {type: String,required: false},
  rol: {type: String,required: false,default: "cliente"},
  password1: {type: String,required: false,default: ""},
  fechaDeRegistro: {type: Date,default: Date.now()},
});

module.exports = {
  Usuario: mongoose.model("Usuarios", UsuarioSchema),
};
