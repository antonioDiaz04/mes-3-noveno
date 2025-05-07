const express = require('express');
const router = express.Router();
const ReseniaController = require('../Controllers/ReseniaController');

router.get('/aprobadas', ReseniaController.obtenerReseniasAceptadas);
// Crear una nueva reseña
router.post('/', ReseniaController.crearResenia);

// Obtener todas las reseñas
router.get('/', ReseniaController.obtenerResenias);

// Obtener una reseña por id
router.get('/:id', ReseniaController.obtenerResenia);

// Actualizar una reseña por id
router.put('/actualizar/:id', ReseniaController.actualizarResenia);

// Eliminar una reseña por id
router.delete('/:id', ReseniaController.eliminarResenia);
router.delete('/eliminar-seleccionadas', ReseniaController.eliminarReseniasSeleccionadas);

// router.get('/aceptar/:id', ReseniaController.aceptarResenia);
// router.get('/rechazar/:id', ReseniaController.rechazarResenia);
router.get('/rechazadas', ReseniaController.obtenerReseniasRechazadas);
router.get('/usuario/:id', ReseniaController.obtenerReseniasPorUsuarioId);
// router.get('/usuario/:id/aceptadas', ReseniaController.obtenerReseniasAceptadasPorUsuario);
// router.get('/usuario/:id/rechazadas', ReseniaController.obtenerReseniasRechazadasPorUsuario);
router.put('/aceptar/:id', ReseniaController.actualizarEstadoAceptacion);
// router.put('/rechazar/:id', ReseniaController.actualizarEstadoRechazo);
// router.get('/promedio/:id', ReseniaController.obtenerPromedioReseniasPorUsuarioId);
module.exports = router;