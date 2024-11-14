const nodemailer = require("nodemailer");
const crypto = require("crypto");
const codigoVerificacion = Math.floor(1000 + Math.random() * 9000).toString();

const { Usuario } = require("../Models/UsuarioModel");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "driftspotky@gmail.com",
    pass: "bdpwlrccwlzwcxeu",
  },
});

exports.enviarCorreoyCuerpo = async (req, res) => {
  try {
    const email = req.body.email;
    const codigo = req.body.codigoVerificacion;
    console.log(email);
    if (!email) {
      return res.status(400).json({ msg: "El email es requerido" });
    }

    // Generar un código de verificación aleatorio (puedes personalizarlo según tus necesidades)
    // const codigoVerificacion = Math.floor(100000 + Math.random() * 900000); // Ejemplo: código de 6 dígitos

    // Actualizar el código de verificación en la base de datos
    // const result = await Usuario.updateOne(
    //   { email: email },
    //   { $set: { codigoVerificacion: codigoVerificacion } }
    // );

    // if (result.nModified === 0) {
    //   return res
    //     .status(404)
    //     .json({ msg: "Usuario no encontrado o sin cambios" });
    // }

    // Enviar el código de verificación por correo
    enviarCodigoVerficiacionActivaCuenta(email, codigo);

    res.status(200).json({ msg: "Correo electrónico enviado correctamente" });
  } catch (error) {
    console.error("Error en enviarCorreoyCuerpo:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// Función para enviar el código de verificación por correo

// const Joi = require('joi'); // Para validación de datos de entrada

exports.confirmarVerficacion = async (req, res) => {
  try {
    const email = req.body.email;

    // Generar un código de verificación aleatorio de 4 dígitos
    const code = Math.floor(1000 + Math.random() * 9000);

    // Actualizar el código de verificación en la base de datos
    const result = await Usuario.updateOne(
      { email: email },
      { $set: { codigoVerificacion: code } }
    );

    if (result.modifiedCount > 0) {
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
// exports.confirmar = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const mailOptions = {
//       from: '"Atelier " <tu_correo@example.com>',
//       to: email,
//       subject: "Confirmar Verificación de Cuenta",
//       html: `<p>para ${email} </p>`,
//       html: `
//       <div style="text-align: center;">
//         <img
//           src="https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGyFH5OuM6r1tACq3-mVFcYR0h90jzEayNHSH3SPMRrI51RogsRfGPAbUgPfKvg07sOtYgtuNKj9Z6QFXwTItIa&_nc_ohc=8hl8yeqpTEEQ7kNvgGedGRK&_nc_zt=23&_nc_ht=scontent.fver2-1.fna&_nc_gid=ABKLJP1JM9SqQAYgwjeYfjR&oh=00_AYBnl4LdKUUFbd65zViJYdqZvy3chdMfV2r0MnTt3CZjxw&oe=671C7743"
//           alt="Logo"
//           style="border-radius: 50%; width: 100px; height: 100px;"
//         />
//       </div>
//       <h1>Confirmar Activación de Cuenta</h1>
//       <p>Hola,</p>
//       <p>Gracias por registrarte. Para activar tu cuenta, por favor confirma haciendo clic en el botón de abajo.</p>
//       <div style="text-align: center; margin-top: 20px;">
//         <form action="http://localhost:4200/api/v1/verificacion/" method="POST">
//           <input type="hidden" name="email" value="${email}" />
//           <button type="submit" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Activar Cuenta</button>
//         </form>
//         <br><br>
//         <button style="padding: 10px 20px; background-color: #F44336; color: white; border: none; border-radius: 5px; cursor: pointer;" onclick="window.location.href='http://tu-dominio.com/cancelar-verificacion';">Cancelar</button>
//       </div>
//       <p>Si no solicitaste esta acción, puedes ignorar este correo.</p>
//       `,
//     };

//     transporter.sendMail(mailOptions, function (err, info) {
//       if (err) {
//         console.error("Error al enviar el correo electrónico:", err);
//         return res.status(500).send("Error al enviar el correo");
//       }
//       console.log("Correo enviado:", info.response);
//       return res.status(200).send("Correo de verificación enviado");
//     });
//   } catch (error) {
//     console.log("Error en la verificación:", error);
//     return res.status(500).send("Error en el servidor");
//   }
// };

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

function enviarCodigoVerficiacionActivaCuenta(email, code) {
  const mailOptions = {
    from: '"Atelier" <atelier>',
    to: email,
    subject: "Activación de cuenta",
    text: `<p>para ${email} </p>`,
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
    <p style="font-size: 20px; font-weight: bold; background-color: #f0f0f0; padding: 10px; border-radius: 5px; text-align: center;" id="codigo">${code}</p>
  `,
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.error("Error al enviar el correo electrónico:", err);
    } else {
      console.log("Correo electrónico enviado:", info.response);
    }
  });
}

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

// const User = require("./models/User"); // Asegúrate de tener el modelo de usuario adecuado
exports.activarCuenta = async (req, res) => {
  try {
    const { email, codigoVerificacion } = req.body;
    const usuario = await Usuario.findOne({ email, codigoVerificacion });

    console.log(req.body);

    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    // Actualiza el estado de verificación del usuario
    usuario.verificado = true;
    await usuario.save();

    // Devuelve un mensaje en formato JSON
    return res.status(200).json({ msg: "Cuenta activada con éxito" });
  } catch (error) {
    console.error("Error al activar la cuenta:", error);
    return res.status(500).json({ msg: "Error en el servidor" });
  }
};
