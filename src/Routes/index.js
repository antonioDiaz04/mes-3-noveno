const { Router } = require('express');
const router = Router();
const webpush = require('../Shareds/webpush'); // Asegúrate de que este archivo exporte una instancia configurada de webpush
const logger = require('../util/logger'); // Importar logger
let pushSubscription;

router.post('/subscription', async (req, res) => {
    try {
        pushSubscription = req.body;
        res.status(200).json();

        const payload = JSON.stringify({
            title: 'Nueva Notificación',
            message: '¡Hola mundo!',
        });

        // Enviar la notificación de manera asíncrona
        await webpush.sendNotification(pushSubscription, payload)
            .then(response => {
                console.log('Notificación enviada con éxito:', response);
            })
            .catch(error => {
                logger.error('Error al enviar la notificación:', error);
                console.error('Error al enviar la notificación:', error);
            });
    } catch (error) {
        logger.error('Error en la ruta de suscripción:', error);
        console.error('Error en la ruta de suscripción:', error);
    }
});

module.exports = router;
