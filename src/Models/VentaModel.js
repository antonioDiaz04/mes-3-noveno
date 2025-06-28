const mongoose = require("mongoose");

const VentaSchema = new mongoose.Schema(
  {
    // Referencia al Usuario
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuarios",
      required: true,
    },

    // Detalles de Productos
    productos: [
      {
        producto: { type: mongoose.Schema.Types.ObjectId, ref: "Producto" },
        cantidad: { type: Number, required: true },
        precioUnitario: { type: Number, required: true },
        descuento: { type: Number, default: 0, min: 0, max: 100 }, // % de descuento
      },
    ],

    // Información de Pago
    detallesPago: {
      metodoPago: {
        type: String,
        enum: [
          "Tarjeta Crédito",
          "Tarjeta Débito",
          "PayPal",
          "Transferencia",
          "Efectivo",
        ],
        required: true,
      },
      ultimosDigitosTarjeta: {
        type: String,
        validate: {
          validator: function (v) {
            return this.detallesPago &&
              this.detallesPago.metodoPago.includes("Tarjeta")
              ? /^\d{4}$/.test(v)
              : true;
          },
          message: "Últimos 4 dígitos inválidos",
        },
        required: false,
      },
    },

    // Resumen Financiero
    resumen: {
      subtotal: { type: Number, required: true, min: 0, default: 0 },
      total: { type: Number, required: true, min: 0, default: 0 },
      anticipo: { type: Number, default: 0 },
      restante: { type: Number, default: 0 },
    },

    // Si es un apartado
    esApartado: {
      type: Boolean,
      default: false,
    },
    fechaLimitePago: {
      type: Date,
    },

    // Estado de la Venta
    estado: {
      type: String,
      enum: [
        "Pendiente",
        "Pagado",
        "Enviado",
        "Entregado",
        "Cancelado",
        "Recogido en Tienda",
      ],
      default: "Pendiente",
    },

    // Notas adicionales
    notas: {
      type: String,
      maxlength: 500,
    },
    fechaDeRegistro: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Calcular totales con descuentos
VentaSchema.methods.calcularTotal = function () {
  if (!this.resumen) {
    this.resumen = { subtotal: 0, total: 0, anticipo: 0, restante: 0 };
  }

  const subtotalProductos = this.productos.reduce((total, producto) => {
    const descuento = producto.descuento || 0;
    const precioConDescuento = producto.precioUnitario * (1 - descuento / 100);
    return total + producto.cantidad * precioConDescuento;
  }, 0);

  this.resumen.subtotal = subtotalProductos;
  this.resumen.total = subtotalProductos;

  if (this.esApartado) {
    const anticipo = Number(this.resumen.anticipo) || 0;
    this.resumen.restante = this.resumen.total - anticipo;
  }
};

// Validación antes de guardar
VentaSchema.pre("save", function (next) {
  if (!this.productos || this.productos.length === 0) {
    return next(new Error("Debe haber al menos un producto en la venta"));
  }

  this.calcularTotal();
  next();
});

// Índices para consultas frecuentes
VentaSchema.index({ usuario: 1, createdAt: -1 });
VentaSchema.index({ estado: 1, createdAt: -1 });

module.exports = mongoose.models.Venta || mongoose.model("Venta", VentaSchema);
