const mongoose = require('mongoose');

const { Schema } = mongoose;

const NotificacionSchema = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: false
    },
    email:{
         type: String,
        required: false
    },
    titulo: {
        type: String,
        required: true
    },
    contenido: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    estado: {
        type: String,
        enum: ['no_leido', 'leido'],
        default: 'no_leido'
    },
    tipo: {
        type: String,
        enum: ['info', 'advertencia','alerta', 'error', 'exito'],
        default: 'info'
    },
    prioridad: {
        type: String,
        enum: ['baja', 'media', 'alta'],
        default: 'media'
    },
    datosAdicionales: {
        type: Schema.Types.Mixed,
        default: null
    }
});

module.exports =  mongoose.model('Notificacion', NotificacionSchema);