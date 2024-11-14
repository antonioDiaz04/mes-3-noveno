const { Router } = require('express');
const router = Router();
const webpush = require('../Shareds/webpush'); // Ensure this file exports a configured webpush instance
let pusSubscription;

router.post('/subscription', async (req, res) => {

    console.log('Received subscription:', pusSubscription);
    PushSubscription = req.body;
    res.status(200).json();
    const payload = JSON.stringify({
        title: 'New Notification',
        message: 'Hello world!', // Fixed typo here
    });

    // Send response before sending notificat7ion

    // Send the notification asynchronously
    try {
        await webpush.sendNotification(pusSubscription, payload)
            .then(response => {
                console.log('Notification sent successfully:', response);
            })
            .catch(error => {
                console.error('Error sending notification:', error);
            });
    } catch (error) {
        console.log(error)
    }
});

module.exports = router;
