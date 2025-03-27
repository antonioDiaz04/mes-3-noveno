const { Usuario } = require("../Models/UsuarioModel");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sanitizeObject = require("../util/sanitize");

const verifyTurnstile = async (captchaToken) => {
  try {
    const url = `https://www.google.com/recaptcha/api/siteverify`;

    const response = await axios.post(url, null, {
      params: {
        secret: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
        response: captchaToken,
      },
    });
    return response.data.success ? true : false;
  } catch (error) {
    console.error("Error al verificar el CAPTCHA:", error);
    return false;
  }
};
// Función para sanitizar objetos
exports.Login = async (req, res) => {
  try {
    const sanitizedData = sanitizeObject(req.body);
    const { email, password, telefono, captchaToken } = sanitizedData;
    let usuario;

    // Buscar por correo electrónico o número de teléfono
    if (email) {
      usuario = await Usuario.findOne({ email }).populate("estadoCuenta");
    } else if (telefono) {
      usuario = await Usuario.findOne({ telefono }).populate("estadoCuenta");
    }

    if (!usuario) {
      return res.status(401).json({ message: "El correo o número de teléfono no está registrado" });
    }

    const estadoCuenta = usuario.estadoCuenta;

    if (estadoCuenta.estado === "bloqueada") {
      const ahora = Date.now();
      const tiempoRestante =
        estadoCuenta.fechaDeUltimoBloqueo.getTime() +
        estadoCuenta.tiempoDeBloqueo * 1000 -
        ahora;

      if (tiempoRestante > 0) {
        return res.status(403).json({
          message: `Cuenta bloqueada. Intenta nuevamente en ${Math.ceil(
            tiempoRestante / 1000
          )} segundos.`,
          tiempo: estadoCuenta.tiempoDeBloqueo,
          numeroDeIntentos: estadoCuenta.intentosFallidos,
        });
      }

      // Restablecer estado de cuenta después de que haya pasado el tiempo de bloqueo
      estadoCuenta.estado = "activa";
      estadoCuenta.intentosFallidos = 0;
      estadoCuenta.fechaDeUltimoBloqueo = null;
      await estadoCuenta.save();
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.password);

    if (!isPasswordValid) {
      estadoCuenta.intentosFallidos += 1;
      estadoCuenta.fechaUltimoIntentoFallido = new Date();

      if (estadoCuenta.intentosFallidos >= estadoCuenta.intentosPermitidos) {
        estadoCuenta.estado = "bloqueada";
        estadoCuenta.fechaDeUltimoBloqueo = new Date();

        const ahora = Date.now();
        const tiempoRestante =
          estadoCuenta.fechaDeUltimoBloqueo.getTime() +
          estadoCuenta.tiempoDeBloqueo * 1000 -
          ahora;
        await estadoCuenta.save();

        return res.status(403).json({
          message: `Cuenta bloqueada. Intenta nuevamente en ${Math.ceil(
            tiempoRestante / 1000
          )} segundos.`,
          tiempo: `${Math.ceil(tiempoRestante / 1000)}`,
          numeroDeIntentos: estadoCuenta.intentosFallidos,
        });
      }

      await estadoCuenta.save();
      return res.status(401).json({
        message: `Contraseña incorrecta,\n Número de intentos fallidos: ${estadoCuenta.intentosFallidos}`,
      });
    }

    // Verificar CAPTCHA
    const isCaptchaValid = await verifyTurnstile(captchaToken);
    if (!isCaptchaValid) {
      return res.status(400).json({ message: "Captcha inválido" });
    }

    estadoCuenta.intentosFallidos = 0;
    await estadoCuenta.save();

    if (!usuario.rol) {
      console.log("Error: El usuario no tiene un rol asignado");
      return res
        .status(401)
        .json({ message: "El usuario no tiene un rol asignado" });
    }

    // Generar el token JWT
    const token = jwt.sign(
      { _id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );

    // Enviar el token en una cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    return res.status(200).json({ token, rol: usuario.rol, captchaValid: isCaptchaValid });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).json({ message: "Error en el servidor: " + error.message });
  }
};
