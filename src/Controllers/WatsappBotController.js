// const { obtenerQR, estaAutenticado, enviarMensaje } = require('../Shareds/whatsappService');

// exports.enviarMensajeController = async (req, res) => {
//   const { numero, mensaje } = req.body;

//   if (!numero || !mensaje) {
//     return res.status(400).json({ error: 'Número de teléfono y mensaje son requeridos' });
//   }

//   try {
//     const resultado = await enviarMensaje(numero, mensaje);
//     if (resultado) {
//       res.json({ success: true, message: 'Mensaje enviado' });
//     } else {
//       res.status(500).json({ error: 'Error al enviar el mensaje' });
//     }
//   } catch (error) {
//     console.error('Error en enviarMensajeController:', error);
//     res.status(500).json({ error: error.message || 'Error al enviar el mensaje' });
//   }
// };

// exports.obtenerQRController = async (req, res) => {
//   try {
//     const qrCode = obtenerQR();
//     if (qrCode) {
//       res.json({ qrCode });
//     } else {
//       res.status(404).json({ error: 'Código QR no disponible' });
//     }
//   } catch (error) {
//     console.error('Error en obtenerQRController:', error);
//     res.status(500).json({ error: 'Error al obtener el código QR' });
//   }
// };

// exports.verificarAutenticacionController = async (req, res) => {
//   try {
//     const authenticated = estaAutenticado();
//     res.json({ authenticated });
//   } catch (error) {
//     console.error('Error en verificarAutenticacionController:', error);
//     res.status(500).json({ error: 'Error al verificar la autenticación' });
//   }
// };