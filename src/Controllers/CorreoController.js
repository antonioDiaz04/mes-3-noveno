const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Usuario } = require("../Models/UsuarioModel");
const {logger} = require("../util/logger");
const sanitizeObject = require("../util/sanitize");

const codigoVerificacion = Math.floor(1000 + Math.random() * 9000).toString();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, //el numero de la suerte xD
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.confirmarVerficacion = async (req, res) => {
  try {
    const { email } = sanitizeObject(req.body);

    if (!email) {
      logger.warn("Intento de verificación sin proporcionar email.");
      return res.status(400).json({ msg: "Debe proporcionar un email." });
    }

    // Generar un código de verificación aleatorio de 4 dígitos
    const code = Math.floor(1000 + Math.random() * 9000);

    // Actualizar el código de verificación en la base de datos
    const result = await Usuario.updateOne(
      { email: email },
      { $set: { codigoVerificacion: code } }
    );

    if (result.modifiedCount > 0) {
      logger.warn(`No se encontró un usuario con el email: ${email}`);
      console.log("Código de verificación actualizado exitosamente.");
    } else {
      console.log("No se encontró un usuario con ese email.");
    }
    // Verificar si se actualizó algún documento
    if (result.matchedCount === 0) {
      return res
        .status(200)
        .json({ msg: "Si el correo existe, se enviará un código" });
    }
    // Enviar el correo con el código de verificación
    await enviarCodigoVerficiacionActivaCuenta(email, code);

    res.status(200).json({ msg: "Si el correo existe, se enviará un código" });
  } catch (error) {
    console.error("Error en confirmarVerficacion:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

function enviarCorreo(correo) {
  const mailOptions = {
    from: '"Hello 👋" <tu_correo@example.com>',
    to: correo,
    subject: "Recuperación de contraseña",
    html: `
    <div style="text-align: center;">
      <img 
        src="https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGyFH5OuM6r1tACq3-mVFcYR0h90jzEayNHSH3SPMRrI51RogsRfGPAbUgPfKvg07sOtYgtuNKj9Z6QFXwTItIa&_nc_ohc=8hl8yeqpTEEQ7kNvgGedGRK&_nc_zt=23&_nc_ht=scontent.fver2-1.fna&_nc_gid=ABKLJP1JM9SqQAYgwjeYfjR&oh=00_AYBnl4LdKUUFbd65zViJYdqZvy3chdMfV2r0MnTt3CZjxw&oe=671C7743" 
        alt="Logo" 
        style="border-radius: 50%; width: 100px; height: 100px;" 
      />
    </div>
    <p>Hola,</p>
    <p>Recibimos una solicitud para restablecer tu contraseña. Ingresa el siguiente código para restablecer la contraseña:</p>
    <p><strong>${codigoVerificacion}</strong></p>
  `,
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.error("error al enviar el correo eléctronico", err);
    } else {
      console.log("correo eléctronico enviado:", info.response);
    }
  });
}

async function enviarCodigoVerficiacionActivaCuenta(email, code) {
  const expiracion = new Date(new Date().getTime() + 15 * 60000);
  const tiempoRestante = Math.floor((expiracion - new Date()) / 60000); // Calcular minutos restantes

  const mailOptions = {
    from: '"Atelier" <atelier>',
    to: email,
    subject: "Activación de cuenta",
    html: `
    <div style="text-align: center;">
      <img 
        src="https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGyFH5OuM6r1tACq3-mVFcYR0h90jzEayNHSH3SPMRrI51RogsRfGPAbUgPfKvg07sOtYgtuNKj9Z6QFXwTItIa&_nc_ohc=8hl8yeqpTEEQ7kNvgGedGRK&_nc_zt=23&_nc_ht=scontent.fver2-1.fna&_nc_gid=ABKLJP1JM9SqQAYgwjeYfjR&oh=00_AYBnl4LdKUUFbd65zViJYdqZvy3chdMfV2r0MnTt3CZjxw&oe=671C7743" 
        alt="Logo" 
        style="border-radius: 50%; width: 100px; height: 100px;" 
      />
    </div>
    <p>Hola,</p>
    <p>Recibimos una solicitud para activar tu cuenta. Ingresa el siguiente código para activarla:</p>
    <p style="font-size: 20px; font-weight: bold; background-color: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center;">${code}</p>
    <p>Este código es válido por <strong>${tiempoRestante} minutos</strong>. Por favor, utilízalo antes de que expire.</p>
    <p>Si no solicitaste esta verificación, ignora este mensaje.</p>
    <p style="font-size: 12px; color: #666;">Atentamente,<br>El equipo de Atelier</p>
  `,
  };

  return transporter.sendMail(mailOptions);
}

exports.enviarCorreoyCuerpo = async (req, res) => {
  try {
    const {email} = sanitizeObject(req.body);

    const codigo = Math.floor(1000 + Math.random() * 9000); // Código de 4 dígitos

    if (!email) {
      logger.warn("Intento de envío de correo sin email.");
      return res.status(400).json({ msg: "El email es requerido" });
    }

    // Hashear el código
    const hashedCode = await bcrypt.hash(codigo.toString(), 10);

    // Generar token con el hash del código
    const token = jwt.sign({ hashedCode }, "clave_secreta", {
      expiresIn: "15m",
    });

    // Enviar correo con el código real
    await enviarCodigoVerficiacionActivaCuenta(email, codigo);

    // Devolver el token al cliente
    res.status(200).json({ msg: "Correo enviado", token });
  } catch (error) {
    logger.error("Error en enviarCorreoyCuerpo:", error);
    console.error("Error en enviarCorreoyCuerpo:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Validar el código ingresado
exports.validarCodigo = async (req, res) => {
  try {
    const { token, codigoIngresado } = req.body;

    if (!token || !codigoIngresado) {
      logger.warn("Intento de validación de código sin token o código.");
      return res.status(400).json({ msg: "Token y código son requeridos" });
    }

    // Verificar token y obtener el hash
    const decoded = jwt.verify(token, "clave_secreta");
    const { hashedCode } = decoded;

    // Comparar código ingresado con el hash
    const isValid = await bcrypt.compare(
      codigoIngresado.toString(),
      hashedCode
    );

    if (isValid) {
      logger.warn("Código de verificación incorrecto.");
      res.status(200).json({ msg: "Código validado correctamente" });
    } else {
      res.status(400).json({ msg: "Código inválido" });
    }
  } catch (error) {
    logger.error("Error en validarCodigo:", error);
    console.error("Error en validarCodigo:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

exports.activarCuenta = async (req, res) => {
  try {
    const { codigoVerificacion } = req.body;
    const {email} = sanitizeObject(req.body);

    const usuario = await Usuario.findOne({ email, codigoVerificacion });

    if (!usuario) {
      logger.warn(`Usuario no encontrado o código incorrecto para ${email}`);
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Actualiza el estado de verificación del usuario
    usuario.verificado = true;
    await usuario.save();

    // Devuelve un mensaje en formato JSON
    return res.status(200).json({ msg: "Cuenta activada con éxito" });
  } catch (error) {
    logger.error("Error al activar la cuenta:", error);
    console.error("Error al activar la cuenta:", error);
    return res.status(500).json({ msg: "Error en el servidor" });
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
//     enviarTokenActivaCuenta(email, token);

//     // Si el usuario tiene un rol, firmar el token JWT con el rol incluido
//     // const token = jwt.sign({ _id: usuario._id, rol: usuario.rol }, "secret");
//     return res.status(200).json({ token, rol: usuario.rol });
//   } catch (error) {
//     console.log("ohh no :", error);
//     return res.status(500).send("Error en el servidor: " + error);
//   }
// };

// exports.enviarCorreoyCuerpo = async (req, res) => {
//   try {
//     const email = req.body.email;
//     const codigo = Math.floor(1000 + Math.random() * 9000); // Generar un código de verificación de 4 dígitos

//     console.log(`Email: ${email}, Código: ${codigo}`);

//     if (!email) {
//       return res.status(400).json({ msg: "El email es requerido" });
//     }

//     // Generar token con el código y una expiración de 15 minutos
//     const token = jwt.sign({ codigo }, 'clave_secreta', { expiresIn: '15m' });

//     // Enviar el código de verificación por correo
//     await enviarCodigoVerficiacionActivaCuenta(email, codigo);

//     res.status(200).json({ msg: "Correo electrónico enviado correctamente" });
//   } catch (error) {
//     console.error("Error en enviarCorreoyCuerpo:", error);
//     res.status(500).json({ msg: "Error en el servidor" });
//   }
// };

// Función para enviar el código de verificación por correo

// const Joi = require('joi'); // Para validación de datos de entrada
