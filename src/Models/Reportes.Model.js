const mongoose = require('mongoose');

const ReporteSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuarios', required: true },
  tipo: { type: String, required: true },
  descripcion: { type: String, required: true, minlength: 10 },
  fecha: { type: Date, default: Date.now },
  estado: { type: String, default: 'pendiente' },
});

const Reporte = mongoose.model('Reporte', ReporteSchema);
module.exports = Reporte;