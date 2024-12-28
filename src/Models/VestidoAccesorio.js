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
});

module.exports = mongoose.model("VestidosAccesorioIncluidos", vestidosAccesorioIncluidosSchema);
