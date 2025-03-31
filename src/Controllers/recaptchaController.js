const axios = require("axios");
const sanitizeObject = require("../util/sanitize");


const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

exports.VerificarCaptcha = async (req, res) => {
  try {
    const token = sanitizeObject(req.body.token); // Sanitizar el token de reCAPTCHA

    if (!token) {
      return res.status(400).json({ message: "Token de reCAPTCHA faltante" });
    }

    const payload = {
      secret: RECAPTCHA_SECRET_KEY,
      response: token,
      // remoteip: req.connection.remoteAddress, // Opcional
    };

    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null, // Este se puede dejar como null
      { params: payload }
    );

    console.log("Respuesta de reCAPTCHA:", response.data);

    const result = response.data;

    if (result.success) {
      return res.status(200).json({ message: "Verificación exitosa", result });
    } else {
      return res.status(400).json({ message: "Verificación fallida", result });
    }
  } catch (error) {
    console.error("Error al verificar reCAPTCHA:", error); // Mejor usar console.error
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
