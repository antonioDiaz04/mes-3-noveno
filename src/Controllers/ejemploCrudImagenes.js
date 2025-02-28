const { Usuario } = require("../Models/UsuarioModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

let BLOCK_TIME_MINUTES = 1;

exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let usuario;
    console.log(req.body);
    usuario = await Usuario.findOne({ email }).populate("estadoCuenta");
    console.table(["correo recibido:", email, "password recibido:", password]);

    // Comprobar si el usuario está bloqueado
    if (usuario.estadoCuenta.estado === "bloqueado") {
      const now = new Date();
      const blockTime = new Date(usuario.estadoCuenta.tiempoDeBloqueo);
      const timeDifference = (now - blockTime) / 1000;

      const remainingTimeInSeconds = BLOCK_TIME_MINUTES * 60 - timeDifference;

      const remainingMinutes = Math.floor(remainingTimeInSeconds / 60); // calcular minutos
      const remainingSeconds = Math.floor(remainingTimeInSeconds % 60); // calcular segundos

      if (remainingTimeInSeconds > 0) {
        return res.status(401).json({
          title: "Usuario bloqueado",
          message: `El usuario se encuentra bloqueado. Tiempo restante: ${remainingMinutes} minutos y ${remainingSeconds} segundos.`,
          minutos: remainingMinutes,
          segundos: remainingSeconds,
          datosCuenta: usuario.estadoCuenta,
        });
      } else {
        // Desbloquear la cuenta
        usuario.estadoCuenta.estado = "activa";
        usuario.estadoCuenta.intentosFallidos = 0;
        usuario.estadoCuenta.tiempoDeBloqueo = null; // Resetear tiempo de bloqueo
        await usuario.estadoCuenta.save(); // Guardar cambios
      }
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.password);

    if (!isPasswordValid) {
      // Incrementar intentos fallidos
      usuario.estadoCuenta.intentosFallidos += 1;
      usuario.estadoCuenta.fechaUltimoIntentoFallido = new Date();

      // Comprobar si se alcanzó el límite de intentos fallidos
      if (
        usuario.estadoCuenta.intentosFallidos >= 5 &&
        usuario.estadoCuenta.estado !== "bloqueado"
      ) {
        usuario.estadoCuenta.estado = "bloqueado";
        usuario.estadoCuenta.vecesDeBloqueos += 1;
        usuario.estadoCuenta.fechaDeUltimoBloqueo = new Date(); // Registrar fecha del último bloqueo
        usuario.estadoCuenta.tiempoDeBloqueo = new Date();
      }

      await usuario.estadoCuenta.save();
      return res.status(401).json({
        title: "Contraseña incorrecta",
        message:
          "La contraseña es incorrecta numero de intentos:" +
          usuario.estadoCuenta.intentosFallidos,
        datosCuenta: usuario.estadoCuenta,
      });
    }

    usuario.estadoCuenta.intentosFallidos = 0;
    await usuario.estadoCuenta.save();

    if (!usuario.rol) {
      // Si el usuario no tiene un rol, enviar un mensaje de error
      return res.status(401).send("El usuario no tiene un rol asignado");
    }
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
    return res.status(200).json({ token, rol: usuario.rol });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).send("Error en el servidor: " + error.message);
  }
};
