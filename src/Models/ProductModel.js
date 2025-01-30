const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: false,
        trim: true
    },
    imagenPrincipal: {
        type: String,
        required: true
    },
    otrasImagenes: {
        type: [String], // Array de URLs de imágenes
        default: []
    },
    categoria: {
        type: String,
        required: false,
        enum: ['Ropa', 'Accesorios', 'Calzado', 'Otro'] // Ejemplo de categorías
    },
    color: {
        type: String,
        required: false
    },
    textura: {
        type: String,
        required: false // Puede ser opcional
    },
    tallasDisponibles: [
        {
            talla: {
                type: String,
                enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Otro'],
                required: false
            },
            medida: {
                type: String, // Ejemplo: "40 cm x 30 cm"
                required: false
            }
        }
    ],
    precio: {
        type: Number,
        required: false,
        min: 0
    },
    estado: {
        disponible: {
            type: Boolean,
            required: false,
            default: true
        },
        tipoVenta: {
            type: String,
            enum: ['Venta', 'Renta'],
            required: false
        },
        nuevo: {
            type: Boolean, // Indica si es nuevo o usado
            required: function() { return this.tipoVenta === 'Venta'; }
        }
    },
    descripcion: {
        type: String,
        required: false,
        trim: true
    }
});




module.exports = mongoose.model('Producto', productoSchema);
