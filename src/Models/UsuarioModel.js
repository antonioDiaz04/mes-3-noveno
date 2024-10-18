const mongoose = require("mongoose");

const UsuarioSchema = mongoose.Schema({

  nombre: {type: String,required: true},
  email: {type: String,unique: true,required: false,},
  telefono: {type: String,required: true},
  token: {type: String,required: false},
  rol: {type: String,required: false,default: "cliente"},
  password: {type: String,required: false,default: ""},
  fechaDeRegistro: {type: Date,default: Date.now()},
});

module.exports = {
  Usuario: mongoose.model("Usuarios", UsuarioSchema),
};
