require('dotenv').config();
const webpush = require('web-push');


// Asegúrate de que las variables de entorno estén definidas correctamente
const PUBLIC_VAPID_KEY = process.env.PUBLIC_VAPID_KEY;
const PRIVATE_VAPID_KEY = process.env.PRIVATE_VAPID_KEY;

// Establecer detalles VAPID
webpush.setVapidDetails(
  'mailto:20221136@uthh.edu.mx',
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY
);

module.exports = webpush;