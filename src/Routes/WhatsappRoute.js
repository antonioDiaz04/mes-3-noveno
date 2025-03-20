const express = require('express');
const router = express.Router();
const whatsappController = require('../Controllers/whatsappController');

const  bot= require('../Controllers/WatsappBotController.js');
// Ruta para enviar un mensaje de WhatsApp
router.post('/enviar-mensaje', whatsappController.enviarMensaje);

// Endpoint para obtener el código QR
// router.get('/qr', bot.obtenerQRController);

// // Endpoint para verificar si el usuario está autenticado
// router.get('/verificar', bot.verificarAutenticacionController);
// router.post('/enviarMensaje', bot.enviarMensajeController);

module.exports = router;
