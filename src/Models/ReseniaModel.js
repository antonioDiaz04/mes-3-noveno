const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ResenaSchema = new Schema({
    usuario: {
        nombre: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            required: true
        }
    },
    calificacion: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    contenido: {
        type: String,
        required: true
    },
    fecha: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        default: null
    },
    estado: {
        type: String,
        enum: ['pendiente', 'aprobada', 'rechazada'],
        default: 'pendiente'
    }
});

module.exports = mongoose.model('Resenia', ResenaSchema);