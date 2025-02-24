const mongoose = require("mongoose");

const vestidosAccesorioIncluidosSchema = mongoose.Schema({
  vestido: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto", // Referencia al modelo Vestido
    required: true,
  },
  accesorios: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accesorio", // Referencia al modelo Accesorio
      required: true,
    },
  ],
  fechaRegistro: {
    type: Date,
    default: Date.now, // Se asigna automáticamente la fecha actual
  },
});

module.exports = mongoose.model("VestidosAccesorioIncluidos", vestidosAccesorioIncluidosSchema);
