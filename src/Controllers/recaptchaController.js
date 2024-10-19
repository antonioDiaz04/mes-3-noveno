const axios = require("axios");

const RECAPTCHA_SECRET_KEY = "6LdBsWMqAAAAAAkHOGSNK6S81AGtqac1Y_w8Pnm1";

exports.VerificarCaptcha = async (req, res) => {
  try {
    // Cambiado a req.body.token si lo envías en el cuerpo
    const token = req.body.token; // Asegúrate de que el cliente envíe el token en el cuerpo de la solicitud
    console.log("Token recibido:", token);

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
