const mongoose = require("mongoose");

const RentaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuarios",
    required: true,
  },

  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto",
    required: true
  },

  detallesRenta: {
    fechaOcupacion: { type: Date, required: true, default: Date.now },
    fechaRecoge: { type: Date, required: true, default: Date.now },
    fechaRegreso: { type: Date, required: true },
    duracionDias: { type: Number, required: true, min: 1 },
    entrega: {
      type: String,
      enum: ['A tiempo', 'Vencida', 'Pendiente'],
      default: 'Pendiente'
    }
  },

  estado: {
    type: String,
    enum: ['Pendiente', 'Activo', 'Completado', 'Cancelado'],
    default: 'Pendiente'
  },

  detallesPago: {
    precioRenta: { type: Number, required: true, min: 0 },
    metodoPago: {
      type: String,
      enum: ['Efectivo', 'Transferencia', 'Tarjeta', 'PayPal'],
      required: true
    },
    fechaPago: { type: Date, default: Date.now }
  },

  multa: {
    type: Number,
    default: 0,
    min: 0
  },
  montoPagado: {
    type: Number,
    default: 0,
    min: 0
  },
  esLiquidado: {
    type: Boolean,
    default: false
  },
  esRecogido: {
    type: Boolean,
    default: false
  },
  montoSobrante: {
    type: Number,
    default: 0,
    min: 0
  },

  notas: {
    type: String,
    maxlength: 500
  },

  fechaDeRegistro: {
    type: Date,
    default: Date.now
  }
});

// Middleware de validación de fechas
RentaSchema.pre("save", function (next) {
  const recogida = this.detallesRenta.fechaRecoge;
  const regreso = this.detallesRenta.fechaRegreso;
  if (regreso <= recogida) {
    return next(new Error('La fecha de regreso debe ser posterior a la fecha de recogida'));
  }
  next();
});

// Método para calcular duración
RentaSchema.methods.calcularDuracion = function () {
  const inicio = this.detallesRenta.fechaRecoge;
  const fin = this.detallesRenta.fechaRegreso;
  return Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
};

// Método para actualizar estado de pago
RentaSchema.methods.actualizarEstadoDePago = function () {
  const totalAPagar = this.detallesPago.precioRenta + (this.multa || 0);
  const diferencia = this.montoPagado - totalAPagar;

  this.esLiquidado = diferencia >= 0;
  this.montoSobrante = diferencia > 0 ? diferencia : 0;
};

module.exports = mongoose.models.Renta || mongoose.model("Renta", RentaSchema);