const express = require('express');
const router = express.Router();
const whatsappController = require('../Controllers/whatsappController');

// Ruta para enviar un mensaje de WhatsApp
router.post('/enviar-mensaje', whatsappController.enviarMensaje);

module.exports = router;
