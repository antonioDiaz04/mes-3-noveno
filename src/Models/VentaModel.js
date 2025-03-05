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
        producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' }, // Usa 'Producto', no 'producto'
        cantidad: Number,
        precioUnitario: Number
      }
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
      },
    },

    // Resumen Financiero
    resumen: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      impuestos: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
        min: 0,
      },
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
        "Recogido en Tienda", // Nueva opción agregada
      ],
      default: "Pendiente",
    },

    // Información Adicional
    notas: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true } // Manejo de createdAt y updatedAt automáticamente
);
// Método para calcular total
VentaSchema.methods.calcularTotal = function () {
  if (!this.resumen) {
    this.resumen = { subtotal: 0, impuestos: 0, total: 0 };
  }

  // Calcular subtotal de productos
  const subtotalProductos = this.productos.reduce((total, producto) => {
    return total + producto.cantidad * producto.precioUnitario;
  }, 0);

  // Calcular total final
  const impuestos = Number(this.resumen.impuestos) || 0;
  this.resumen.subtotal = subtotalProductos;
};

// Middleware pre-save para calcular total antes de guardar
VentaSchema.pre("save", function (next) {
  // Validar que haya productos
  if (this.productos.length === 0) {
    return next(new Error("Debe haber al menos un producto en la venta"));
  }

  // Calcular total
  this.calcularTotal();

  next();
});

// Índices adicionales para optimización de consultas frecuentes
VentaSchema.index({ usuario: 1, fechaVenta: -1 }); // Optimiza las búsquedas de ventas por usuario y fecha
VentaSchema.index({ estado: 1, fechaVenta: -1 }); // Optimiza las búsquedas de ventas por estado y fecha

const Venta = mongoose.model("Venta", VentaSchema);

module.exports = Venta;
