// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    // --- Referencias a otros Modelos ---
    // ID del usuario que realizó la transacción.
    // Obligatorio, referencia a la colección 'Usuarios'.
    idUsuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuarios', // Asegúrate de que este nombre coincida con el nombre del modelo exportado de Usuario
        required: true,
        index: true // Se recomienda indexar para búsquedas rápidas por usuario
    },
    // ID del vestido involucrado en la transacción.
    // Obligatorio, referencia a la colección 'Vestido'.
    idVestido: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vestido', // Asegúrate de que este nombre coincida con el nombre del modelo exportado de Vestido
        required: true,
        index: true // Se recomienda indexar para búsquedas rápidas por vestido
    },

    // --- Detalles de la Transacción ---
    // Tipo de transacción: 'venta' o 'renta'. Obligatorio.
    tipoTransaccion: {
        type: String,
        enum: ['venta', 'renta'],
        required: true
    },
    // Fecha y hora en que se registró la transacción. Por defecto, la fecha actual.
    fechaTransaccion: {
        type: Date,
        default: Date.now,
        index: true // Útil para consultas de rango de fechas
    },
    // Monto total de la transacción. Obligatorio.
    montoTotal: {
        type: Number,
        required: true,
        min: 0 // Asegura que el monto no sea negativo
    },
    // Estado general de la transacción.
    estado: {
        type: String,
        enum: ['pendiente', 'completada', 'cancelada', 'en_proceso_devolucion'],
        default: 'pendiente',
        index: true // Útil para filtrar transacciones por su estado
    },

    // --- Detalles del Pago ---
    detallesPago: {
        estadoPago: {
            type: String,
            enum: ['pendiente', 'pagado_parcial', 'pagado_total', 'reembolsado'],
            default: 'pendiente'
        },
        cantidadPagada: {
            type: Number,
            default: 0,
            min: 0
        },
        metodoPago: {
            type: String,
            enum: ['efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia_bancaria', 'paypal', 'otro'],
            required: true // El método de pago es requerido una vez que se inicia el pago
        },
        fechaUltimoPago: {
            type: Date
        },
        // Un ID de transacción externo si se usa una pasarela de pago (Stripe, PayPal, etc.)
        idTransaccionPasarela: {
            type: String,
            required: false
        }
    },

    // --- Detalles Específicos para Rentas ---
    // Estos campos solo serán relevantes si `tipoTransaccion` es 'renta'.
    detallesRenta: {
        fechaInicioRenta: {
            type: Date,
            required: function() { return this.tipoTransaccion === 'renta'; }
        },
        fechaFinRenta: {
            type: Date,
            required: function() { return this.tipoTransaccion === 'renta'; },
            validate: { // La fecha de fin debe ser posterior a la de inicio
                validator: function(value) {
                    return this.detallesRenta.fechaInicioRenta ? value > this.detallesRenta.fechaInicioRenta : true;
                },
                message: 'La fecha de fin de renta debe ser posterior a la fecha de inicio.'
            }
        },
        depositoGarantia: {
            type: Number,
            min: 0,
            required: function() { return this.tipoTransaccion === 'renta'; }
        },
        estadoDeposito: {
            type: String,
            enum: ['pendiente', 'devuelto_total', 'devuelto_parcial', 'retenido'],
            default: 'pendiente'
        },
        multasAplicadas: {
            type: Number,
            default: 0,
            min: 0
        }
    },

    // --- Detalles de Entrega y Devolución (cuando son presenciales en el local) ---
    // Detalles cuando el vestido es recogido por el cliente
    detallesEntregaLocal: {
        fechaRecogida: {
            type: Date
        },
        condicionVestidoAlEntregar: {
            type: String, // Ej: 'excelente', 'con_detalle_menor'
            enum: ["excelente", "bueno", "daño_menor", "usado"]
        },
        notaInternaLocal: {
            type: String // Notas para el personal del local sobre la entrega
        }
    },
    // Detalles cuando el vestido es devuelto por el cliente (solo para rentas)
    detallesDevolucionLocal: {
        fechaDevolucion: {
            type: Date,
            required: function() { return this.tipoTransaccion === 'renta' && this.estado === 'completada'; } // Asumiendo que se completa al devolver
        },
        condicionVestidoAlDevolver: {
            type: String, // Ej: 'excelente', 'con_mancha', 'dañado'
            enum: ["excelente", "bueno", "daño_menor", "dañado", "sucio"]
        },
        notaInternaLocal: {
            type: String // Notas para el personal del local sobre la devolución
        }
    },

    // --- Reseña del Cliente ---
    reseñaCliente: {
        comentario: {
            type: String,
            trim: true
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        fechaReseña: {
            type: Date
        }
    }
}, {
    timestamps: true // Añade `createdAt` y `updatedAt` automáticamente
});

// --- Middleware para validaciones condicionales o pre-procesamiento ---

// Pre-save hook para manejar la lógica de estado basada en `tipoTransaccion`
transactionSchema.pre('save', function(next) {
    if (this.tipoTransaccion === 'venta') {
        // Para ventas, limpia o anula los campos específicos de renta
        this.detallesRenta = undefined;
        this.detallesDevolucionLocal = undefined;
        // Una venta generalmente se completa al entregar si es presencial
        if (this.detallesEntregaLocal && this.detallesEntregaLocal.fechaRecogida && this.estado === 'pendiente') {
            this.estado = 'completada';
        }
    } else if (this.tipoTransaccion === 'renta') {
        // Asegúrate de que los campos de renta estén presentes y no dejes los de venta si hubiera alguna confusión
        // Aquí no se anulan los campos de venta porque los detalles de entrega local aplican a ambos.
        if (!this.detallesRenta.fechaInicioRenta || !this.detallesRenta.fechaFinRenta || this.detallesRenta.depositoGarantia === undefined) {
             return next(new Error('Los campos de renta son obligatorios para este tipo de transacción.'));
        }
    }
    next();
});

module.exports = mongoose.model('transacciones', transactionSchema);