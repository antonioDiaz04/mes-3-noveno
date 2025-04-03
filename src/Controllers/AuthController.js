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
    return response.data.success;
  } catch (error) {
    // logger.error("Error al verificar el CAPTCHA:", error.message);
    return false;
  }
};
const logger = require('../../src/util/logger');

exports.Login = async (req, res) => {
  const logBase = {
    timestamp: new Date().toISOString(),
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    event: 'login_attempt'
  };

  try {
    const sanitizedData = sanitizeObject(req.body);
    const { email, password, telefono, captchaToken } = sanitizedData;

    // Contexto adicional para logs

    const logContext = { 
      ...logBase,
      email: email || null,
      telefono: telefono || null
    };

    // logger.info('Inicio de proceso de login', logContext);

    let usuario;
    if (email) {
      usuario = await Usuario.findOne({ email }).populate("estadoCuenta");
      logger.debug('Búsqueda de usuario por email', { ...logContext, searchBy: 'email' });
    } else if (telefono) {
      usuario = await Usuario.findOne({ telefono }).populate("estadoCuenta");
      logger.debug('Búsqueda de usuario por teléfono', { ...logContext, searchBy: 'telefono' });
    }

    if (!usuario) {
      const logData = {
        ...logContext,
        level: 'warn',
        event: 'login_failed',
        reason: 'usuario_no_encontrado'
      };

      // logger.warn('Intento de login con credenciales no registradas', logData);

      return res.status(401).json({ message: "El correo o número de teléfono no está registrado" });
    }

    // Agregar información del usuario al contexto de logs
    logContext.userId = usuario._id.toString();
    logContext.estadoCuenta = usuario.estadoCuenta.estado;

    const estadoCuenta = usuario.estadoCuenta;

    if (estadoCuenta.estado === "bloqueada") {
      const ahora = Date.now();
      const tiempoRestante = estadoCuenta.fechaDeUltimoBloqueo.getTime() + 
                           estadoCuenta.tiempoDeBloqueo * 1000 - ahora;

      if (tiempoRestante > 0) {
        const logData = {
          ...logContext,
          level: 'warn',
          event: 'account_blocked',
          tiempoRestanteSeg: Math.ceil(tiempoRestante / 1000),
          intentosFallidos: estadoCuenta.intentosFallidos
        };

        // logger.warn('Intento de login en cuenta bloqueada', logData);

        return res.status(403).json({
          message: `Cuenta bloqueada. Intenta nuevamente en ${Math.ceil(tiempoRestante / 1000)} segundos.`,
          tiempo: estadoCuenta.tiempoDeBloqueo,
          numeroDeIntentos: estadoCuenta.intentosFallidos,
        });
      }

      // Restablecer estado de cuenta
      estadoCuenta.estado = "activa";
      estadoCuenta.intentosFallidos = 0;
      estadoCuenta.fechaDeUltimoBloqueo = null;
      await estadoCuenta.save();
      
      // logger.info('Cuenta desbloqueada automáticamente', logContext);
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.password);

    if (!isPasswordValid) {
      estadoCuenta.intentosFallidos += 1;
      estadoCuenta.fechaUltimoIntentoFallido = new Date();

      if (estadoCuenta.intentosFallidos >= estadoCuenta.intentosPermitidos) {
        estadoCuenta.estado = "bloqueada";
        estadoCuenta.fechaDeUltimoBloqueo = new Date();
        await estadoCuenta.save();

        const logData = {
          ...logContext,
          level: 'error',
          event: 'account_blocked',
          reason: 'max_intentos_fallidos',
          intentosFallidos: estadoCuenta.intentosFallidos
        };

        // logger.error('Cuenta bloqueada por máximo de intentos fallidos', logData);

        return res.status(403).json({
          message: `Cuenta bloqueada. Intenta nuevamente en ${estadoCuenta.tiempoDeBloqueo} segundos.`,
          tiempo: estadoCuenta.tiempoDeBloqueo,
          numeroDeIntentos: estadoCuenta.intentosFallidos,
        });
      }

      await estadoCuenta.save();

      const logData = {
        ...logContext,
        level: 'warn',
        event: 'login_failed',
        reason: 'password_incorrecta',
        intentosFallidos: estadoCuenta.intentosFallidos
      };

      // logger.warn('Intento de login con contraseña incorrecta', logData);

      return res.status(401).json({
        message: `Contraseña incorrecta,\n Número de intentos fallidos: ${estadoCuenta.intentosFallidos}`,
      });
    }

    // Verificar CAPTCHA
    const isCaptchaValid = await verifyTurnstile(captchaToken);
    if (!isCaptchaValid) {
      const logData = {
        ...logContext,
        level: 'warn',
        event: 'login_failed',
        reason: 'captcha_invalido'
      };

      // logger.warn('Intento de login con CAPTCHA inválido', logData);

      return res.status(400).json({ message: "Captcha inválido" });
    }

    // Resetear intentos fallidos
    estadoCuenta.intentosFallidos = 0;
    await estadoCuenta.save();
    logger.debug('Intentos fallidos reseteados', logContext);

    if (!usuario.rol) {
      const logData = {
        ...logContext,
        level: 'error',
        event: 'login_failed',
        reason: 'rol_no_asignado'
      };

      // logger.error('Usuario sin rol asignado', logData);

      return res.status(401).json({ message: "El usuario no tiene un rol asignado" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { _id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Log de éxito
    const successLog = {
      ...logContext,
      level: 'info',
      event: 'login_success',
      rol: usuario.rol
    };

    // logger.info('Login exitoso', successLog);

    // Configurar cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    return res.status(200).json({ 
      token, 
      rol: usuario.rol, 
      captchaValid: isCaptchaValid 
    });

  } catch (error) {
    const errorLog = {
      ...logBase,
      level: 'error',
      event: 'server_error',
      error: error.message,
      stack: error.stack
    };

    // logger.error('Error en el servidor durante el login', errorLog);

    return res.status(500).json({ 
      message: "Error en el servidor",
      errorId: logBase.timestamp // Para correlacionar con logs
    });
  }
};
exports.signInGoogleFacebook = async (req, res) => {
  try {
    const sanitizedData = sanitizeObject(req.body);
    const { displayName, email, photoURL, uid } = sanitizedData;

    if (!email) {
      return res.status(400).json({ message: "El email es requerido" });
    }

    // Buscar usuario existente
    let usuario = await Usuario.findOne({ email }).populate("estadoCuenta");

    if (usuario) {
      // Manejar cuenta existente
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

        // Restablecer cuenta bloqueada
        estadoCuenta.estado = "activa";
        estadoCuenta.intentosFallidos = 0;
        estadoCuenta.fechaDeUltimoBloqueo = null;
        await estadoCuenta.save();
      }
    } else {
      // Crear nuevo usuario para Google/Facebook
      const primerUsuario = await Usuario.findOne().populate("estadoCuenta");
      if (!primerUsuario || !primerUsuario.estadoCuenta) {
        return res.status(500).json({ 
          message: "No se pudo obtener la configuración de estado de cuenta" 
        });
      }

      const { intentosPermitidos, tiempoDeBloqueo } = primerUsuario.estadoCuenta;
      const nuevoEstadoCuenta = await EstadoCuenta.create({
        intentosPermitidos,
        tiempoDeBloqueo,
        estado: "activa"
      });

      usuario = await Usuario.create({
        fotoDePerfil: photoURL,
        nombre: displayName,
        email,
        estadoCuenta: nuevoEstadoCuenta._id,
        token: "",
        codigoVerificacion: null,
        verificado: true, // Usuarios de redes sociales verificados
        rol: "usuario", // Rol por defecto
        uid // ID único del proveedor OAuth
      });
      
      usuario = await Usuario.findById(usuario._id).populate("estadoCuenta");
    }

    // Resetear intentos fallidos
    usuario.estadoCuenta.intentosFallidos = 0;
    await usuario.estadoCuenta.save();

    // Generar token JWT
    const token = jwt.sign(
      { _id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );

    // Configurar cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 86400000, // 24 horas en ms
    });

    return res.status(200).json({ 
      token, 
      rol: usuario.rol,
      usuario: {
        nombre: usuario.nombre,
        email: usuario.email,
        fotoDePerfil: usuario.fotoDePerfil
      }
    });

  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).json({ 
      message: "Error en el servidor",
      error: error.message 
    });
  }
};
