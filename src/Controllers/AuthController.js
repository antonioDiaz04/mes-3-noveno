const { Usuario } = require("../Models/UsuarioModel");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// const webpush = require("../Shareds/webpush");
let BLOCK_TIME_MINUTES = 1;
exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email }).populate("estadoCuenta");

    if (!usuario) return res.status(401).send("El correo no esta registrado");

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
      return res.status(401).send("El usuario no tiene un rol asignado");
    }

    const token = jwt.sign({ _id: usuario._id, rol: usuario.rol }, "secret");
    return res.status(200).json({ token, rol: usuario.rol });
  } catch (error) {
    console.log("ohh no :", error);
    return res.status(500).send("Error en el servidor: " + error);
  }
};
