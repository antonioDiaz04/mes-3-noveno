// src/services/whatsappService.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const client = new Client({
  authStrategy: new LocalAuth(),
});

let qrCodeData = null;

client.on('qr', (qr) => {
  qrcode.toDataURL(qr, (err, url) => {
    if (err) {
      console.error('Error al generar el QR:', err);
    } else {
      qrCodeData = url;
    }
  });
});

client.on('ready', () => {
  console.log('Cliente de WhatsApp listo!');
});

client.on('auth_failure', (msg) => {
  console.error('Error de autenticación:', msg);
});

client.on('disconnected', (reason) => {
  console.error('Cliente desconectado:', reason);
});

client.initialize();

const obtenerQR = () => {
  return qrCodeData;
};

const estaAutenticado = () => {
  return client.info ? true : false;
};

const enviarMensaje = async (numero, mensaje) => {
  try {
    const chatId = `${numero}@c.us`; // Formato del ID del chat
    await client.sendMessage(chatId, mensaje);
    console.log(`Mensaje enviado a ${numero}: ${mensaje}`);
  } catch (error) {
    console.error('Error al enviar el mensaje:', error);
  }
};

module.exports = { obtenerQR, estaAutenticado, enviarMensaje };
