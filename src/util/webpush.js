const { enviarNotificacion } = require("./webpush");


const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
  };
  
  webpush.setVapidDetails(
    "mailto:20221136@uthh.edu.mx",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );  

// Función para enviar notificaciones push
const enviarNotificacion = async (pushSubscription, payload) => {
  try {
    const notificationPayload = JSON.stringify(payload);
    const response = await webpush.sendNotification(pushSubscription, notificationPayload)
  } catch (err) {
    console.error("Error al enviar la notificación:", err);
    throw new Error("Error al enviar la notificación");
  }
};

module.exports = { enviarNotificacion };
