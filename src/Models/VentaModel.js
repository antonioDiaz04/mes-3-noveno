const mongoose = require('mongoose');

const VentaSchema = new mongoose.Schema({
  // Referencia al Usuario
  usuario: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuarios', 
    required: true 
  },

  // Detalles de Productos
  productos: [{
    producto: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Producto', 
      required: true 
    },
    cantidad: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    precioUnitario: { 
      type: Number, 
      required: true 
    }
  }],

  // Información de Pago
  detallesPago: {
    metodoPago: { 
      type: String, 
      enum: [
        'Tarjeta Crédito', 
        'Tarjeta Débito', 
        'PayPal', 
        'Transferencia', 
        'Efectivo'
      ], 
      required: true 
    },
    ultimosDigitosTarjeta: { 
      type: String, 
      validate: {
        validator: function(v) {
          return /^\d{4}$/.test(v);
        },
        message: 'Últimos 4 dígitos inválidos'
      }
    }
  },

  // Resumen Financiero
  resumen: {
    subtotal: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    impuestos: { 
      type: Number, 
      default: 0 
    },
    descuentos: { 
      type: Number, 
      default: 0 
    },
    total: { 
      type: Number, 
      required: true, 
      min: 0 
    }
  },

  // Información de Envío
  envio: {  
    direccion: {
      calle: { 
        type: String, 
        required: true 
      },
      ciudad: { 
        type: String, 
        required: true 
      },
      estado: { 
        type: String, 
        required: true 
      },
      codigoPostal: { 
        type: String, 
        required: true 
      },
      pais: { 
        type: String, 
        default: 'México' 
      }
    },
    metodoEnvio: { 
      type: String, 
      enum: ['Estándar', 'Express', 'Prioritario'],
      default: 'Estándar'
    },
    costoEnvio: { 
      type: Number, 
      default: 0 
    }
  },

  // Estado de la Venta
  estado: { 
    type: String, 
    enum: [
      'Pendiente', 
      'Pagado', 
      'Enviado', 
      'Entregado', 
      'Cancelado'
    ], 
    default: 'Pendiente' 
  },

  // Fechas
  fechaVenta: { 
    type: Date, 
    default: Date.now 
  },
  fechaEntregaEstimada: { 
    type: Date 
  },

  // Información Adicional
  notas: { 
    type: String, 
    maxlength: 500 
  }
}, {
  timestamps: true // Añade createdAt y updatedAt
});

// Método para calcular total
VentaSchema.methods.calcularTotal = function() {
  // Calcular subtotal de productos
  const subtotalProductos = this.productos.reduce((total, producto) => {
    return total + (producto.cantidad * producto.precioUnitario);
  }, 0);

  // Calcular total final
  this.resumen.subtotal = subtotalProductos;
  this.resumen.total = subtotalProductos + 
                        this.resumen.impuestos - 
                        this.resumen.descuentos + 
                        this.envio.costoEnvio;
};

// Middleware pre-save para calcular total
VentaSchema.pre('save', function(next) {
  // Validar que haya productos
  if (this.productos.length === 0) {
    return next(new Error('Debe haber al menos un producto en la venta'));
  }

  // Calcular total
  this.calcularTotal();
  
  // Establecer fecha de entrega estimada
  if (!this.fechaEntregaEstimada) {
    const diasEntrega = this.envio.metodoEnvio === 'Express' ? 3 : 
                        this.envio.metodoEnvio === 'Prioritario' ? 1 : 7;
    this.fechaEntregaEstimada = new Date(Date.now() + diasEntrega * 24 * 60 * 60 * 1000);
  }

  next();
});

const Venta = mongoose.model('Venta', VentaSchema);

module.exports = Venta;
