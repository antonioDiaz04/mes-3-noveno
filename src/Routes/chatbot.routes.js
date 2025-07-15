const express = require('express');
const router = express.Router();
const BotController = require('../Controllers/BotController');

// Tendencias
router.get('/tendencias', BotController.obtenerTendencias);

// Consejo inteligente
router.get('/consejo', BotController.obtenerConsejo);

// Por categoría
router.get('/por-categoria', BotController.vestidosPorCategoria);

// Precio por nombre de vestido
router.get('/precio', BotController.obtenerPrecio);

// Horarios de atención
router.get('/horarios', BotController.obtenerHorarios);

module.exports = router;
