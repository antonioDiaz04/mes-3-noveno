const express = require('express');
const router = express.Router();
const ReseniaController = require('../Controllers/ReseniaController');

// Crear una nueva reseña
router.post('/crear', ReseniaController.crearResenia);

// Obtener todas las reseñas
router.get('/', ReseniaController.obtenerResenias);

// Obtener una reseña por id
router.get('/:id', ReseniaController.obtenerResenia);

// Actualizar una reseña por id
router.put('/:id', ReseniaController.actualizarResenia);

// Eliminar una reseña por id
router.delete('/:id', ReseniaController.eliminarResenia);


module.exports = router;