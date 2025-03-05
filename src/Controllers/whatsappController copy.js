const {logger} = require("../util/logger");
const request = require("request");

function generarCodigoVerificacion() {
  return Math.floor(100000 + Math.random() * 900000);
}

// Controlador para enviar el mensaje de WhatsApp con código de verificación personalizado
exports.enviarMensaje = (req, res) => {
  try {
    // Generar un código de verificación
    const codigoVerificacion = generarCodigoVerificacion();

    // Definir los parámetros de la solicitud
    const targetURL = "https://api.smsmasivos.com.mx/whatsapp/send";

    // Configurar la solicitud POST con el código de verificación generado
    request.post(
      {
        url: targetURL,
        headers: {
          apikey: "6085396c1dad959881f31836df8784febb4cfe93", // Tu clave API
        },
        form: {
          instance_id: "r3pptb71-t3ww-wv65-w9of-vbcp9so85b23", // Tu ID de instancia
          type: "text", // Tipo de mensaje (puede ser "text" o "media")
          number: "7711403469", // Número al que enviar el mensaje
          country_code: "52", // Código de país (por ejemplo, "52" para México)
          message: `Hola, tu código de verificación es: ${codigoVerificacion}. No lo compartas con nadie.`, // Mensaje personalizado
        },
      },
      (err, response, body) => {
        if (err) {
          console.error("Error al enviar el mensaje:", err);
          return res.status(500).json({ error: "Error al enviar el mensaje" });
        }

        // Retorna la respuesta del API de SMS Masivos
        console.log("Mensaje enviado:", body);
        return res
          .status(200)
          .json({
            message: "Mensaje enviado con éxito",
            body: JSON.parse(body),
          });
      }
    );
  } catch (error) {
    logger.error(`Error en el controlador enviarMensaje: ${error.message}`); // Error
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
