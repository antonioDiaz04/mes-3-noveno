const mongoose = require("mongoose");

const RentaSchema = new mongoose.Schema({
  // Referencia a Usuario
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuarios",
    required: true,
  },
  // Referencia a Producto
  producto: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Producto", 
    required: true
  },

  // Detalles de Renta
  detallesRenta: {
    fechaOcupacion: { type: Date, required: true, default: Date.now },
    fechaRecoge: { type: Date, required: true, default: Date.now },
    fechaRegreso: { type: Date, required: true },
    duracionDias: { type: Number, required: true, min: 1 }
  },

  // Estado de la Renta
  estado: { 
    type: String, 
    enum: ['Pendiente', 'Activo', 'Completado', 'Cancelado'],
    default: 'Pendiente' 
  },

  // Detalles de Pago
  detallesPago: {
    precioRenta: { type: Number, required: true, min: 0 },
    metodoPago: { 
      type: String, 
      enum: ['Efectivo', 'Transferencia', 'Tarjeta', 'PayPal'],
      required: true 
    },
    fechaPago: { type: Date, default: Date.now }
  },

  // Nuevos campos relacionados al pago y multa
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

  // Información adicional
  notas: {
    type: String,
    maxlength: 500
  },

  // Fechas de registro
  fechaDeRegistro: {
    type: Date,
    default: Date.now
  }
});

// Middleware para validar fechas
RentaSchema.pre("save", function(next) {
  if (this.detallesRenta.fechaFin <= this.detallesRenta.fechaInicio) {
    return next(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));
  }
  next();
});

// Método para calcular duración
RentaSchema.methods.calcularDuracion = function() {
  const inicio = this.detallesRenta.fechaInicio;
  const fin = this.detallesRenta.fechaFin;
  return Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
};

// Método para calcular si está liquidado y cuánto sobra
RentaSchema.methods.actualizarEstadoDePago = function() {
  const totalAPagar = this.detallesPago.precioRenta + (this.multa || 0);
  const diferencia = this.montoPagado - totalAPagar;

  this.esLiquidado = diferencia >= 0;
  this.montoSobrante = diferencia > 0 ? diferencia : 0;
};

const Renta = mongoose.model("Renta", RentaSchema);
module.exports = Renta;
