const webpush = require("web-push");
const Notificacion = require('../Models/NotificacionModel');

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

webpush.setVapidDetails(
  "mailto:driftspotky@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Función auxiliar para validar token y guardar suscripción si no existe
async function validarYGuardarSuscripcion({ token, userId, email }) {
  if (!token || !token.endpoint || !token.keys || !token.keys.p256dh || !token.keys.auth) {
    throw new Error("Token de suscripción inválido");
  }

  // Buscar si ya existe
  const existente = await Notificacion.findOne({ endpoint: token.endpoint });
  if (!existente) {
    await Notificacion.create({
      userId: userId || null,
      email: email || null,
      endpoint: token.endpoint,
      p256dh: token.keys.p256dh,
      auth: token.keys.auth,
    });
  }
}

exports.guardarSuscripcion = async (req, res) => {
  try {
    const { userId, email, token } = req.body;
    await validarYGuardarSuscripcion({ token, userId, email });
    res.status(201).json({ message: "Suscripción guardada con éxito" });
  } catch (err) {
    console.error("Error al guardar suscripción:", err);
    res.status(400).json({ message: err.message || "Error interno" });
  }
};

exports.enviarNotificacion = async (req, res) => {
  try {
    const { token, userId, email } = req.body;
    if (!token) return res.status(400).json({ message: "Token de suscripción no proporcionado" });

    let tokenData = typeof token === "string" ? JSON.parse(token) : token;
    await validarYGuardarSuscripcion({ token: tokenData, userId, email });

    const pushSubscription = {
      endpoint: tokenData.endpoint,
      keys: {
        p256dh: tokenData.keys.p256dh,
        auth: tokenData.keys.auth,
      },
    };

    const payload = {
      notification: {
        title: "¡Apartado Realizado!",
        body: "Has realizado un apartado. Tienes 24 horas para completar el pago.",
        icon: "https://cdn-icons-png.flaticon.com/512/189/189665.png",
        image: "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "pay_now", title: "Completar Pago" },
          { action: "cancel", title: "Cancelar Apartado" },
        ],
        vibrate: [200, 100, 200],
      },
    };

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

    console.log("Notificación enviada con éxito");
    res.status(200).json({ message: "Notificación enviada con éxito" });
  } catch (err) {
    console.error("Error al enviar la notificación:", err);
    res.status(500).json({ message: "Error al enviar la notificación", error: err.message });
  }
};

exports.enviarNotificacionyCuerpo = async (req, res) => {
  try {
    const { token, userId, email } = req.body;
    if (!token) return res.status(400).json({ message: "Token de suscripción no proporcionado" });

    let tokenData = typeof token === "string" ? JSON.parse(token) : token;
    await validarYGuardarSuscripcion({ token: tokenData, userId, email });

    const pushSubscription = {
      endpoint: tokenData.endpoint,
      keys: {
        p256dh: tokenData.keys.p256dh,
        auth: tokenData.keys.auth,
      },
    };

    const payload = {
      notification: {
        title: "¡Nuevas ofertas disponibles!",
        body: "Haz clic para ver las últimas ofertas en nuestro sitio.",
        image: "https://logowik.com/content/uploads/images/angular-new6082.logowik.com.webp",
        actions: [
          { action: "view_offers", title: "Ver ofertas" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

    console.log("Notificación enviada con éxito");
    res.status(200).json({ message: "Notificación enviada con éxito" });
  } catch (err) {
    console.error("Error al enviar la notificación:", err);
    res.status(500).json({ message: "Error al enviar la notificación", error: err.message });
  }
};

exports.enviarNotificacionRecordatorioDevolucionRenta = async (req, res) => {
  try {
    const { token, userId, email } = req.body;
    if (!token) return res.status(400).json({ message: "Token de suscripción no proporcionado" });

    let tokenData = typeof token === "string" ? JSON.parse(token) : token;
    await validarYGuardarSuscripcion({ token: tokenData, userId, email });

    const pushSubscription = {
      endpoint: tokenData.endpoint,
      keys: {
        p256dh: tokenData.keys.p256dh,
        auth: tokenData.keys.auth,
      },
    };

    const payload = {
      notification: {
        title: "¡Recordatorio de devolución de renta!",
        body: "Recuerda devolver el producto rentado antes de la fecha límite.",
        image: "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "view_rental", title: "Ver Renta" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

    console.log("Notificación enviada con éxito");
    res.status(200).json({ message: "Notificación enviada con éxito" });
  } catch (err) {
    console.error("Error al enviar la notificación:", err);
    res.status(500).json({ message: "Error al enviar la notificación", error: err.message });
  }
};

exports.enviarNotificacionLlevateCarrito = async (req, res) => {
  try {
    const { token, userId, email } = req.body;
    if (!token) return res.status(400).json({ message: "Token de suscripción no proporcionado" });

    let tokenData = typeof token === "string" ? JSON.parse(token) : token;
    await validarYGuardarSuscripcion({ token: tokenData, userId, email });

    const pushSubscription = {
      endpoint: tokenData.endpoint,
      keys: {
        p256dh: tokenData.keys.p256dh,
        auth: tokenData.keys.auth,
      },
    };

    const payload = {
      notification: {
        title: "¡No olvides tu carrito!",
        body: "Tienes productos en tu carrito. ¡Completa tu compra ahora!",
        image: "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "view_cart", title: "Ver Carrito" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

    console.log("Notificación enviada correctamente");
    res.status(200).json({ message: "Notificación enviada correctamente" });
  } catch (err) {
    console.error("Error al enviar la notificación", err);
    res.status(500).json({ message: "Error al enviar la notificación desde el backend", error: err.message });
  }
};


// funcional
exports.enviarNotificacionCorreo = async (req, res) => {
  // Verificar si el token de suscripción se ha proporcionado en el cuerpo de la solicitud
  if (!req.body.token) {
    return res
      .status(400)
      .json({ message: "Token de suscripción no proporcionado" });
  } else {
    console.log("token=>", req.body.token);
  }

  try {
    const tokenData = JSON.parse(req.body.token);
    const { endpoint, keys } = tokenData;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: "Datos de suscripción inválidos" });
    }
    const pushSubscription = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };

    const payload = {
      notification: {
        title: "Código enviado",
        body: "Hemos enviado un código a tu correo electrónico. Por favor, revisa tu bandeja de entrada.",
        image:
          "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "check_email", title: "Revisar Correo" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };

    // Usar webpush.sendNotification en lugar de enviarNotificacion
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    console.log("Notificación enviada correctamente");

    res.status(200).json({ message: "Notificación enviada correctamente" });
  } catch (err) {
    console.error("Error al enviar la notificación", err);
    res.status(500).json({
      message: "Error al enviar la notificación",
      error: err.message,
    });
  }
};

exports.enviarNotificacionNuevosProductos = async (req, res) => {
  // Verificar si el token de suscripción se ha proporcionado en el cuerpo de la solicitud
  if (!req.body.token) {
    return res
      .status(400)
      .json({ message: "Token de suscripción no proporcionado" });
  } else {
    console.log("token=>", req.body.token);
  }

  try {
    const tokenData = JSON.parse(req.body.token);
    const { endpoint, keys } = tokenData;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: "Datos de suscripción inválidos" });
    }

    const pushSubscription = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };
    const payload = {
      notification: {
        title: "¡Nuevos productos disponibles!",
        body: "Descubre los últimos productos que hemos agregado a nuestra tienda.",
        image:
          "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "view_products", title: "Ver Productos" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };
    // Usar webpush.sendNotification en lugar de enviarNotificacion
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    console.log("Notificación enviada correctamente");

    res.status(200).json({ message: "Notificación enviada correctamente" });
  } catch (err) {
    console.error("Error al enviar la notificación", err);
    res.status(500).json({
      message: "Error al enviar la notificación",
      error: err.message,
    });
  }
}
exports.enviarNotificacionComentarios = async (req, res) => {
  // Verificar si el token de suscripción se ha proporcionado en el cuerpo de la solicitud
  if (!req.body.token) {
    return res
      .status(400)
      .json({ message: "Token de suscripción no proporcionado" });
  } else {
    console.log("token=>", req.body.token);
  }

  try {
    const tokenData = JSON.parse(req.body.token);
    const { endpoint, keys } = tokenData;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: "Datos de suscripción inválidos" });
    }

    const pushSubscription = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };
    const payload = {
      notification: {
        title: "¡Nuevo comentario!",
        body: "Alguien ha comentado en tu publicación. Haz clic para verlo.",
        image:
          "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "view_comment", title: "Ver Comentario" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };
    // Usar webpush.sendNotification en lugar de enviarNotificacion
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    console.log("Notificación enviada correctamente");

    res.status(200).json({ message: "Notificación enviada correctamente" });
  } catch (err) {
    console.error("Error al enviar la notificación", err);
    res.status(500).json({
      message: "Error al enviar la notificación desde enviarNotificacionLlevateCarrito",
      error: err.message,
    });
  }
}
exports.enviarNotificacionComentariosRespuesta = async (req, res) => {
  // Verificar si el token de suscripción se ha proporcionado en el cuerpo de la solicitud
  if (!req.body.token) {
    return res
      .status(400)
      .json({ message: "Token de suscripción no proporcionado" });
  } else {
    console.log("token=>", req.body.token);
  }

  try {
    const tokenData = JSON.parse(req.body.token);
    const { endpoint, keys } = tokenData;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: "Datos de suscripción inválidos" });
    }

    const pushSubscription = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };

    const payload = {
      notification: {
        title: "¡Nueva respuesta a tu comentario!",
        body: "Alguien ha respondido a tu comentario. Haz clic para verlo.",
        image:
          "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "view_response", title: "Ver Respuesta" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };

    // Usar webpush.sendNotification en lugar de enviarNotificacion
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    console.log("Notificación enviada correctamente");

    res.status(200).json({ message: "Notificación enviada correctamente" });
  } catch (err) {
    console.error("Error al enviar la notificación", err);
    res.status(500).json({
      message: "Error al enviar la notificación ",
      error: err.message,
    });
  }
}
exports.enviarNotificacionProductosOfertas = async (req, res) => {
  // Verificar si el token de suscripción se ha proporcionado en el cuerpo de la solicitud
  if (!req.body.token) {
    return res
      .status(400)
      .json({ message: "Token de suscripción no proporcionado" });
  } else {
    console.log("token=>", req.body.token);
  }

  try {
    const tokenData = JSON.parse(req.body.token);
    const { endpoint, keys } = tokenData;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: "Datos de suscripción inválidos" });
    }

    const pushSubscription = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };

    const payload = {
      notification: {
        title: "¡Nuevas ofertas en productos!",
        body: "Aprovecha nuestras ofertas especiales en productos seleccionados.",
        image:
          "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "view_offers", title: "Ver Ofertas" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };
    // Usar webpush.sendNotification en lugar de enviarNotificacion
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    console.log("Notificación enviada correctamente");

    res.status(200).json({ message: "Notificación enviada correctamente" });
  } catch (err) {
    console.error("Error al enviar la notificación", err);
    res.status(500).json({
      message: "Error al enviar la notificación desde",
      error: err.message,
    });
  }
}
exports.enviarNotificacionBienvenidaAteleier = async (req, res) => {
  // Verificar si el token de suscripción se ha proporcionado en el cuerpo de la solicitud
  if (!req.body.token) {
    return res
      .status(400)
      .json({ message: "Token de suscripción no proporcionado" });
  } else {
    console.log("token=>", req.body.token);
  }

  try {
    const tokenData = JSON.parse(req.body.token);
    const { endpoint, keys } = tokenData;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: "Datos de suscripción inválidos" });
    }

    const pushSubscription = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };

    const payload = {
      notification: {
        title: "¡Bienvenido a Ateleier!",
        body: "Explora nuestras ofertas y productos exclusivos.",
        image:
          "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "explore", title: "Explorar" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

    console.log("Notificación enviada con éxito");
    res.status(200).json({ message: "Notificación enviada con éxito" });
  } catch (err) {
    console.error("Error al enviar la notificación:", err);
    res
      .status(500)
      .json({ message: "Error al enviar la notificación", error: err.message });
  }
}
exports.enviarNotificacionBienvenidaAteleierComprar = async (req, res) => {
  //   // Verificar si el token de suscripción se ha proporcionado en el cuerpo de la solicitud
  if (!req.body.token) {
    return res
      .status(400)
      .json({ message: "Token de suscripción no proporcionado" });
  } else {
    console.log("token=>", req.body.token);
  }

  try {
    const tokenData = JSON.parse(req.body.token);
    const { endpoint, keys } = tokenData;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: "Datos de suscripción inválidos" });
    }

    const pushSubscription = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };

    const payload = {
      notification: {
        title: "¡Bienvenido a Ateleier!",
        body: "Explora nuestras ofertas y productos exclusivos.",
        image:
          "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "explore", title: "Explorar" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

    console.log("Notificación enviada con éxito");
    res.status(200).json({ message: "Notificación enviada con éxito" });
  } catch (err) {
    console.error("Error al enviar la notificación:", err);
    res
      .status(500)
      .json({ message: "Error al enviar la notificación", error: err.message });
  }
}
exports.enviarNotificacionSuscripcion = async (req, res) => {
  //   // Verificar si el token de suscripción se ha proporcionado en el cuerpo de la solicitud
  if (!req.body.token) {
    return res
      .status(400)
      .json({ message: "Token de suscripción no proporcionado" });
  } else {
    console.log("token=>", req.body.token);
  }

  try {
    const tokenData = JSON.parse(req.body.token);
    const { endpoint, keys } = tokenData;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: "Datos de suscripción inválidos" });
    }

    const pushSubscription = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };

    const payload = {
      notification: {
        title: "¡Gracias por suscribirte!",
        body: "Recibirás las últimas novedades y ofertas.",
        image:
          "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "view_offers", title: "Ver Ofertas" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

    console.log("Notificación enviada con éxito");
    res.status(200).json({ message: "Notificación enviada con éxito" });
  } catch (err) {
    console.error("Error al enviar la notificación:", err);
    res
      .status(500)
      .json({ message: "Error al enviar la notificación", error: err.message });
  }
}
exports.enviarNotificacionSuscripcionRenovacion = async (req, res) => {
  // Verificar si el token de suscripción se ha proporcionado en el cuerpo de la solicitud
  if (!req.body.token) {
    return res
      .status(400)
      .json({ message: "Token de suscripción no proporcionado" });
  } else {
    console.log("token=>", req.body.token);
  }

  try {
    const tokenData = JSON.parse(req.body.token);
    const { endpoint, keys } = tokenData;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: "Datos de suscripción inválidos" });
    }

    const pushSubscription = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };

    const payload = {
      notification: {
        title: "¡Renovación de suscripción exitosa!",
        body: "Tu suscripción ha sido renovada. ¡Gracias por seguir con nosotros!",
        image:
          "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "view_offers", title: "Ver Ofertas" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

    console.log("Notificación enviada con éxito");
    res.status(200).json({ message: "Notificación enviada con éxito" });
  } catch (err) {
    console.error("Error al enviar la notificación:", err);
    res
      .status(500)
      .json({ message: "Error al enviar la notificación", error: err.message });
  }
}
exports.enviarNotificacionNuevosProductosSuscriptores = async (req, res) => {
  // Verificar si el token de suscripción se ha proporcionado en el cuerpo de la solicitud
  if (!req.body.token) {
    return res
      .status(400)
      .json({ message: "Token de suscripción no proporcionado" });
  } else {
    console.log("token=>", req.body.token);
  }

  try {
    const tokenData = JSON.parse(req.body.token);
    const { endpoint, keys } = tokenData;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: "Datos de suscripción inválidos" });
    }



    const pushSubscription = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };

    const payload = {
      notification: {
        title: "¡Nuevos productos para suscriptores!",
        body: "Descubre los nuevos productos que hemos agregado para nuestros suscriptores.",
        image:
          "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "view_products", title: "Ver Productos" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

    console.log("Notificación enviada con éxito");
    res.status(200).json({ message: "Notificación enviada con éxito" });
  } catch (err) {
    console.error("Error al enviar la notificación:", err);
    res
      .status(500)
      .json({ message: "Error al enviar la notificación", error: err.message });
  }
}




exports.enviarNotificacionAgradecimientoCompra = async (req, res) => {
  //   // Verificar si el token de suscripción se ha proporcionado en el cuerpo de la solicitud
  if (!req.body.token) {
    return res
      .status(400)
      .json({ message: "Token de suscripción no proporcionado" });
  } else {
    console.log("token=>", req.body.token);
  }

  try {
    const tokenData = JSON.parse(req.body.token);
    const { endpoint, keys } = tokenData;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: "Datos de suscripción inválidos" });
    }

    const pushSubscription = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };

    const payload = {
      notification: {
        title: "¡Gracias por tu compra!",
        body: "Esperamos que disfrutes de tu producto.",
        image:
          "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "view_order", title: "Ver Pedido" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

    console.log("Notificación enviada con éxito");
    res.status(200).json({ message: "Notificación enviada con éxito" });
  } catch (err) {
    console.error("Error al enviar la notificación:", err);
    res
      .status(500)
      .json({ message: "Error al enviar la notificación", error: err.message });
  }
}
exports.enviarNotificacionRentaExtendida = async (req, res) => {
  //   // Verificar si el token de suscripción se ha proporcionado en el cuerpo de la solicitud
  if (!req.body.token) {
    return res
      .status(400)
      .json({ message: "Token de suscripción no proporcionado" });
  } else {
    console.log("token=>", req.body.token);
  }

  try {
    const tokenData = JSON.parse(req.body.token);
    const { endpoint, keys } = tokenData;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: "Datos de suscripción inválidos" });
    }
    const pushSubscription = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };
    const payload = {
      notification: {
        title: "¡Renta extendida!",
        body: "Tu renta ha sido extendida. Disfruta de más tiempo con tu producto.",
        image:
          "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "view_rental", title: "Ver Renta" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    console.log("Notificación enviada con éxito");
    res.status(200).json({ message: "Notificación enviada con éxito" });
  }
  catch (err) {
    console.error("Error al enviar la notificación:", err);
    res
      .status(500)
      .json({ message: "Error al enviar la notificación", error: err.message });
  }
}
exports.enviarNotificacionMotivacionRenta = async (req, res) => {
  //   // Verificar si el token de suscripción se ha proporcionado en el cuerpo de la solicitud
  if (!req.body.token) {
    return res
      .status(400)
      .json({ message: "Token de suscripción no proporcionado" });
  } else {
    console.log("token=>", req.body.token);
  }

  try {
    const tokenData = JSON.parse(req.body.token);
    const { endpoint, keys } = tokenData;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: "Datos de suscripción inválidos" });
    }

    const pushSubscription = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };

    const payload = {
      notification: {
        title: "¡Agradecemos tu renta!",
        body: "Esperamos que disfrutes de tu producto. ¡Gracias por elegirnos!",
        image:
          "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "view_rental", title: "Ver Renta" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    console.log("Notificación enviada con éxito");
    res.status(200).json({ message: "Notificación enviada con éxito" });
  }
  catch (err) {
    console.error("Error al enviar la notificación:", err);
    res
      .status(500)
      .json({ message: "Error al enviar la notificación", error: err.message });
  }
}

exports.llevateTuProducto = async (req, res) => {
  // Verificar si el token de suscripción se ha proporcionado en el cuerpo de la solicitud
  if (!req.body.token) {
    return res
      .status(400)
      .json({ message: "Token de suscripción no proporcionado" });
  } else {
    console.log("body=>", req.body);
  }

  try {
    // Solo parsear si el token es un string, de lo contrario usarlo directamente
    const tokenData = typeof req.body.token === "string"
      ? JSON.parse(req.body.token)
      : req.body.token;

    const { endpoint, keys } = tokenData;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res
        .status(400)
        .json({ message: "Datos de suscripción inválidos" });
    }

    const pushSubscription = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };

    const payload = {
      notification: {
        title: "¡Llévate tu producto!",
        body: "Tu producto está listo para ser recogido. ¡Ven a recogerlo!",
        image:
          "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "pick_up", title: "Recoger Producto" },
          { action: "dismiss", title: "Descartar" },
        ],
        vibrate: [100, 50, 100],
      },
    };
    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    console.log("Notificación enviada correctamente");

    res.status(200).json({ message: "Notificación enviada correctamente" });
  } catch (err) {
    console.error("Error al enviar la notificación", err);
    res.status(500).json({
      message: "Error al enviar la notificación",
      error: err.message,
    });
  }
}


exports.enviaNotificacion = async (req, res) => {
  try {
    const nuevaNotificacion = new Notificacion({
      ...req.body,
      estado: 'pendiente' // Asegurar que todas las nuevas reseñas sean pendientes
    });
    const { email, asunto, mensaje } = req.body;

    if (!email || !asunto || !mensaje) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    const guardaNotificacion = await nuevaNotificacion.save();



    const mailOptions = {
      from: '"Atelier" <atelier>',
      to: email,
      subject: asunto,
      html: mensaje,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Correo enviado exitosamente" });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
}
