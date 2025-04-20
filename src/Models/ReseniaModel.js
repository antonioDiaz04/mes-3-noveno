const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResenaSchema = new Schema({
    usuarioId: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    // El productoId es opcional, solo se asigna si la reseña es para un producto.
    productoId: {
        type: Schema.Types.ObjectId,
        ref: 'Producto',
        default: null
    },
    // Calificación en estrellas (reseña)
    estrellas: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comentarios: {
        type: String,
        default: ""
    },
    // Indica si la reseña ha sido aceptada o validada
    aceptado: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resenia', ResenaSchema);