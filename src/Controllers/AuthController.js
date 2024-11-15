const { Usuario } = require("../Models/UsuarioModel");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const verifyTurnstile = async (captchaToken) => {
  console.log(captchaToken)
  const secretKey = process.env.CLOUDFLARE_SECRET_KEY; // Tu clave secreta de Cloudflare
  const url = `https://challenges.cloudflare.com/turnstile/v0/siteverify`;

  try {
    const response = await axios.post(url, {
      secret: secretKey,
      response: captchaToken, // El token del CAPTCHA recibido del cliente
    });

    if (response.data.success) {
      console.error("El CAPTCHA es válido:", response.data);
      return true; // El CAPTCHA es válido
    } else {
      console.error("El CAPTCHA no es válido:", response.data);
      return false; // El CAPTCHA no es válido
    }
  } catch (error) {
    console.error("Error al verificar el CAPTCHA:", error);
    return false;
  }
};
exports.Login = async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;
    let usuario;

    usuario = await Usuario.findOne({ email }).populate("estadoCuenta");

    if (!usuario) {
      console.log("Error: El correo no existe");
      return res.status(401).json({ message: "El correo no existe" });
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
          )}  segundos.`,
          tiempo: `${Math.ceil(tiempoRestante / 1000)}`,
          numeroDeIntentos: estadoCuenta.intentosFallidos,
        });
      }

      await estadoCuenta.save();
      return res.status(401).json({
        message: `Contraseña incorrecta,\n Numero de intentos fallidos: ${estadoCuenta.intentosFallidos}`,
      });
    }
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
    const token = jwt.sign(
      { _id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    return res
      .status(200)
      .json({ token, rol: usuario.rol, captchaValid: isCaptchaValid });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return res
      .status(500)
      .json({ message: "Error en el servidor: " + error.message });
  }
};

// exports.verificarCodigo = async (req, res) => {
//   try {
//     const { email, codigo } = req.body;
//     // let usuario;
//     const usuario = await Usuario.findOne({ email, codigoVerificacion });

//     console.table([
//       "correo recibido:",
//       email,
//       "codigoVerificacion recibido:",
//       codigoVerificacion,
//     ]);
//     // Verificar si el código es válido
//     const isCodigoValido = await bcrypt.compare(
//       codigo,
//       usuario.codigoVerificacion
//     );
//     if (!isCodigoValido) {
//       return res
//         .status(401)
//         .json({ message: "Código de verificación incorrecto." });
//     }

//     // Generar el token JWT
//     const token = jwt.sign(
//       { _id: usuario._id, rol: usuario.rol },
//       process.env.JWT_SECRET || "secret",
//       {
//         expiresIn: "1h", // El token expirará en 1 hora
//       }
//     );

//     console.log("aqui llego tambien :");

//     // Si el usuario tiene un rol, firmar el token JWT con el rol incluido
//     // const token = jwt.sign({ _id: usuario._id, rol: usuario.rol }, "secret");
//     return res.status(200).json({ token, rol: usuario.rol });
//   } catch (error) {
//     console.log("ohh no :", error);
//     return res.status(500).send("Error en el servidor: " + error);
//   }
// };
