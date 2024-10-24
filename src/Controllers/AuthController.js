const { Usuario } = require("../Models/UsuarioModel");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// const webpush = require("../Shareds/webpush");

exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let usuario;

    console.log("Request body:", req.body);
    usuario = await Usuario.findOne({ email });

    console.table([
      ["Correo recibido:", email],
      ["Password recibido:", password],
    ]);

    if (!usuario) {
      console.log("Error: El correo no existe");
      return res.status(401).send("El correo no existe");
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
    return res.status(200).json({ token, rol: usuario.rol });
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
