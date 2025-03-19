const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const { logger } = require("../util/logger");
require("dotenv").config();

function generarCodigoVerificacion() {
  return Math.floor(100000 + Math.random() * 900000); // Genera un código de 6 dígitos
}

exports.enviarMensaje = async (req, res) => {
  try {
    const { number_to_send } = req.body; // Obtener número de teléfono del request

    if (!number_to_send) {
      return res.status(400).json({ error: "El número de teléfono es requerido" });
    }

    // Generar código de verificación
    const codigoVerificacion = generarCodigoVerificacion();

    const targetURL = "https://api.smsmasivos.com.mx/whatsapp/send";
    const headers = {
      apikey: process.env.SMS_API_KEY, 
    };
    const data = {
      instance_id: process.env.SMS_INSTANCE_ID, 
      type: "text",
      number: number_to_send, // Número al que enviar el mensaje
      country_code: process.env.SMS_COUNTRY_CODE,
      message: `Hola, tu código de verificación es: ${codigoVerificacion}. No lo compartas con nadie.`, 
    };

    const response = await axios.post(targetURL, data, { headers });


    return res.status(200).json({ message: "Mensaje enviado con éxito", response: response.data });
  } catch (error) {
    logger.error("Error al enviar el mensaje:", error);
    return res.status(500).json({ error: "Error en el servidor al enviar el mensaje" });
  }
};

// Controlador para enviar el mensaje de WhatsApp con código de verificación personalizado
// exports.enviarMensaje = async (req, res) => {
//   // Generar un código de verificación
//   const codigoVerificacion = generarCodigoVerificacion();

//   // Definir los parámetros de la solicitud
//   const targetURL = "https://api.smsmasivos.com.mx/whatsapp/send";

//   // Configurar la solicitud POST con el código de verificación generado
//   request.post(
//     {
//       url: targetURL,
//       headers: {
//         apikey: process.env.SMS_API_KEY, // Tu clave API
//       },
//       form: {
//         instance_id: process.env.SMS_INSTANCE_ID, // Tu ID de instancia
//         type: "text", // Tipo de mensaje (puede ser "text" o "media")
//         number: process.env.SMS_TARGET_NUMBER, // Número al que enviar el mensaje
//         country_code: process.env.SMS_COUNTRY_CODE, // Código de país (por ejemplo, "52" para México)
//         message: `Hola, tu código de verificación es: ${codigoVerificacion}. No lo compartas con nadie.`, // Mensaje personalizado
//       },
//     },
//     (err, response, body) => {
//       if (err) {
//         logger.error("Error al enviar el mensaje:", err);

//         return res.status(500).json({ error: "Error al enviar el mensaje" });
//       }

//       // Retorna la respuesta del API de SMS Masivos
//       console.log("Mensaje enviado:", body);
//       return res
//         .status(200)
//         .json({ message: "Mensaje enviado con éxito", body: JSON.parse(body) });
//     }
//   );

//   const response = await axios.post(targetURL, data, { headers });

// };

// Validación del código
exports.validarCodigo = async (req, res) => {
  try {
    const { token, codigoIngresado } = req.body;

    if (!token || !codigoIngresado) {
      return res.status(400).json({ msg: "Token y código son requeridos" });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { hashedCode } = decoded;

    // Comparar el código ingresado con el hash almacenado
    const isMatch = await bcrypt.compare(
      codigoIngresado.toString(),
      hashedCode
    );

    if (isMatch) {
      return res.status(200).json({ msg: "Código verificado correctamente" });
    } else {
      return res.status(400).json({ msg: "Código incorrecto" });
    }
  } catch (error) {
    logger.error("Error en validarCodigo:", error);

    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// exports.enviarMensaje = async (req, res) => {
//   try {
//     const { number_to_send } = req.body;
//     console.log(number_to_send);
//     if (!number_to_send) {
//       return res
//         .status(400)
//         .json({ msg: "El número de teléfono es requerido" });
//     }

//     // Generar un código de 4 dígitos
//     const codigo = Math.floor(1000 + Math.random() * 9000);

//     // Hashear el código
//     const hashedCode = await bcrypt.hash(codigo.toString(), SALT_ROUNDS);

//     // Generar token JWT que contiene el hash del código
//     const token = jwt.sign({ hashedCode }, "clave_secreta", {
//       expiresIn: "15m",
//     });

//     const targetURL = "https://api.smsmasivos.com.mx/whatsapp/send";

//     // Enviar mensaje de WhatsApp con el código (sin hash)
//     request.post(
//       {
//         url: targetURL,
//         headers: {
//           "apikey": "35b2ca1a0d6af4a4b475372fd4ea9cdde5d6d583", // Cambia por tu API key real
//         },
//         form: {
//           "instance_id": "r3pptb71-t3ww-wv65-w9of-vbcp9so85b23",
//           "type_to_send": "text",
//           "number": number_to_send,
//           "country_code": "52",
//           "message": `🔐 ¡Tu código de verificación es: ${codigo}! 🔐\n\nEste código es válido por 10 minutos.\n¡No lo compartas con nadie!\n\nSi no solicitaste este código, por favor ignora este mensaje.\n💬 Gracias por confiar en nosotros.`,
//         },
//       },
//       (err, response, body) => {
//         if (err) {
//           console.error("Error al enviar el mensaje:", err);
//           return res.status(500).json({ msg: "Error al enviar el mensaje" });
//         }

//         // Devolver el token con el hash al cliente
//        return res.status(200).json({ msg: "Mensaje enviado", token });
//       }
//     );
//   } catch (error) {
//     console.error("Error en enviarMensajeYToken:", error);
//     res.status(500).json({ msg: "Error en el servidor" });
//   }
// };
