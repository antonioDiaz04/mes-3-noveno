const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");

// const webpush = require("../Shareds/webpush");

const verifyTurnstile = async (captchaToken) => {
  const secretKey = process.env.CLOUDFLARE_SECRET_KEY; // Tu clave secreta de Cloudflare
  const url = `https://challenges.cloudflare.com/turnstile/v0/siteverify`;

  try {
    const response = await axios.post(url, {
      secret: secretKey,
      response: captchaToken, // El token del CAPTCHA recibido del cliente
    });

    if (response.data.success) {
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

    usuario = await Usuario.findOne({ email });

    if (!usuario) {
      console.log("Error: El correo no existe");
      return res.status(401).send("El correo no existe");
    }
    const isCaptchaValid = await verifyTurnstile(captchaToken);
    if (!isCaptchaValid) {
      return res.status(400).json({ message: "Captcha inválido" });
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      console.log("Error: Contraseña incorrecta");
      return res.status(401).send("Contraseña incorrecta");
    }

    // Verificar si el usuario tiene un rol
    if (!usuario.rol) {
      console.log("Error: El usuario no tiene un rol asignado");
      return res.status(401).send("El usuario no tiene un rol asignado");
    }

    // Firmar el token JWT con el rol incluido y una expiración de 1 hora
    const token = jwt.sign(
      { _id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET || "secret", // Mejor usar variables de entorno para el secreto
      { expiresIn: "24h" } // Token expira en 1 hora
    );

    console.log("Token JWT generado:", token);

    // Si deseas usar cookies para el token:
    res.cookie("token", token, {
      httpOnly: true, // Evita que JavaScript en el cliente acceda a la cookie
      secure: process.env.NODE_ENV === "production", // Solo se envía por HTTPS en producción
      sameSite: "Strict", // Evita ataques CSRF
      maxAge: 3600000, // La cookie expira en 1 hora
    });

    // Devolver respuesta con token en el cuerpo o como cookie
    return res
      .status(200)
      .json({ token, rol: usuario.rol, captchaValid: isCaptchaValid });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).send("Error en el servidor: " + error.message);
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
