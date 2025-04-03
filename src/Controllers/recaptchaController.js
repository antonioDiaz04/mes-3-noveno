const axios = require("axios");

const RECAPTCHA_SECRET_KEY = "6LdBsWMqAAAAAAkHOGSNK6S81AGtqac1Y_w8Pnm1";

exports.VerificarCaptcha = async (req, res) => {
  try {
    // Cambiado a req.body.token si lo envías en el cuerpo
    const token = req.body.token; // Asegúrate de que el cliente envíe el token en el cuerpo de la solicitud
    console.log("Token recibido:", token);

    if (!token) {
      // logger.warn("Token de reCAPTCHA faltante");
      return res.status(400).json({ message: "Token de reCAPTCHA faltante" });
    }

    const payload = {
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: token,
      // remoteip: req.connection.remoteAddress, // Opcional
    };

    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null, // Este se puede dejar como null
      { params: payload }
    );

    const result = response.data;

    if (result.success) {
      logger.info("Verificación reCAPTCHA exitosa");
      return res.status(200).json({ message: "Verificación exitosa", result });
    } else {
      // logger.warn("Verificación reCAPTCHA fallida");
      return res.status(400).json({ message: "Verificación fallida", result });
    }
  } catch (error) {
    // logger.error("Error al verificar reCAPTCHA", error); 
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
