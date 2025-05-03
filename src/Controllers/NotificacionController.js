const webpush = require("web-push");
// const { logger } = require("../util/logger");

const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

webpush.setVapidDetails(
  "mailto:20221136@uthh.edu.mx",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

exports.enviarNotificacion = async (req, res) => {
  try {
    // Validar si el token está presente en la solicitud
    if (!req.body.token) {
      // logger.warn("Token de suscripción no proporcionado");
      return res
        .status(400)
        .json({ message: "Token de suscripción no proporcionado" });
    }

    // Convertir el token JSON a un objeto JavaScript
    const tokenData = JSON.parse(req.body.token);

    // Extraer los valores necesarios
    const { endpoint, keys } = tokenData;
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      // logger.warn("Datos de suscripción inválidos");
      return res.status(400).json({ message: "Datos de suscripción inválidos" });
    }

    const pushSubscription = {
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    };

    // Mensaje de notificación
    const payload = {
      notification: {
        title: "¡Apartado Realizado!",
        body: "Has realizado un apartado. Tienes 24 horas para completar el pago.",
        icon: "https://cdn-icons-png.flaticon.com/512/189/189665.png", // Ícono representativo
        image:
          "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
        actions: [
          { action: "pay_now", title: "Completar Pago" },
          { action: "cancel", title: "Cancelar Apartado" },
        ],
        vibrate: [200, 100, 200],
      },
    };

    await enviarNotificacion(pushSubscription, payload);

    console.log("Notificación enviada con éxito");
    res.status(200).json({ message: "Notificación enviada con éxito" });
  } catch (err) {
    // logger.error(`Error al enviar la notificación: ${err.message}`);
    res
      .status(500)
      .json({ message: "Error al enviar la notificación", error: err.message });
  }
};

exports.enviarNotificacionyCuerpo = async (req, res) => {
  const pushSubscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cG9WhFIPP3A:APA91bFZ5N5SGliIWMF3wjQdoUdXEgCduuLr2-GUXEan--zTbDbDGxvyzuc0yed1yYlxIXXTpU3_Q810k_n54ATbNpu-ux87i4c2_tq98UNIRDPGhKp6e8RyWXc7EGSgpXOEsTsgfkxL",
    keys: {
      p256dh:
        "BFYNEZ1MT-60MYXrHCw5yV5VpwRiwssxn6XBm_uYm3voHIgChwKvdOAejTAn3ICbSxM7jzb__PXmVeaq5t1W2Uw",
      auth: "WYqIQk0zn75glwwdWzPR4w",
    },
  };
  const payload = {
    notification: {
      title: "¡Nuevas ofertas disponibles!",
      body: "Haz clic para ver las últimas ofertas en nuestro sitio.",
      image:
        "https://logowik.com/content/uploads/images/angular-new6082.logowik.com.webp",
      actions: [
        { action: "view_offers", title: "Ver ofertas" },
        { action: "dismiss", title: "Descartar" },
      ],
      vibrate: [100, 50, 100],
    },
  };

  try {
    await enviarNotificacion(pushSubscription, payload);

    console.log("Notification sent successfully");
    res.status(200).send("Notification sent successfully");
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).send("Error sending notification");
  }
};

// Enviar notificación a todas las suscripciones
// exports.enviarNotificacion = async (req, res) => {
//   const payload = JSON.stringify({
//     notification: {
//       title: "Hola Mundo",
//       body: "¡Notificación enviada dinámicamente!",
//     },
//   });

//   try {
//     await Promise.all(suscripciones.map(sub => webpush.sendNotification(sub, payload)));
//     res.json({ message: "Notificación enviada exitosamente" });
//   } catch (error) {
//     console.error("Error enviando notificación", error);
//     res.status(500).json({ error: "Error enviando notificación" });
//   }
// };

exports.enviarNotificacionCorreo = async (req, res) => {
  const pushSubscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cG9WhFIPP3A:APA91bFZ5N5SGliIWMF3wjQdoUdXEgCduuLr2-GUXEan--zTbDbDGxvyzuc0yed1yYlxIXXTpU3_Q810k_n54ATbNpu-ux87i4c2_tq98UNIRDPGhKp6e8RyWXc7EGSgpXOEsTsgfkxL",
    keys: {
      p256dh:
        "BFYNEZ1MT-60MYXrHCw5yV5VpwRiwssxn6XBm_uYm3voHIgChwKvdOAejTAn3ICbSxM7jzb__PXmVeaq5t1W2Uw",
      auth: "WYqIQk0zn75glwwdWzPR4w",
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

  try {
    await enviarNotificacion(pushSubscription, payload);

    console.log("Notification sent successfully");
    // Enviar la respuesta como JSON
    res.status(200).json({ message: "Notification sent successfully" });
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).json({ message: "Error sending notification" });
  }
};
exports.enviarNotificacionNuevosProductos = async (req, res) => {
  const pushSubscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cG9WhFIPP3A:APA91bFZ5N5SGliIWMF3wjQdoUdXEgCduuLr2-GUXEan--zTbDbDGxvyzuc0yed1yYlxIXXTpU3_Q810k_n54ATbNpu-ux87i4c2_tq98UNIRDPGhKp6e8RyWXc7EGSgpXOEsTsgfkxL",
    keys: {
      p256dh:
        "BFYNEZ1MT-60MYXrHCw5yV5VpwRiwssxn6XBm_uYm3voHIgChwKvdOAejTAn3ICbSxM7jzb__PXmVeaq5t1W2Uw",
      auth: "WYqIQk0zn75glwwdWzPR4w",
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
  try {
    await enviarNotificacion(pushSubscription, payload);

    console.log("Notification sent successfully");
    res.status(200).send("Notification sent successfully");
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).send("Error sending notification");
  }
}
exports.enviarNotificacionComentarios = async (req, res) => {
  const pushSubscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cG9WhFIPP3A:APA91bFZ5N5SGliIWMF3wjQdoUdXEgCduuLr2-GUXEan--zTbDbDGxvyzuc0yed1yYlxIXXTpU3_Q810k_n54ATbNpu-ux87i4c2_tq98UNIRDPGhKp6e8RyWXc7EGSgpXOEsTsgfkxL",
    keys: {
      p256dh:
        "BFYNEZ1MT-60MYXrHCw5yV5VpwRiwssxn6XBm_uYm3voHIgChwKvdOAejTAn3ICbSxM7jzb__PXmVeaq5t1W2Uw",
      auth: "WYqIQk0zn75glwwdWzPR4w",
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
  try {
    await enviarNotificacion(pushSubscription, payload);

    console.log("Notification sent successfully");
    res.status(200).send("Notification sent successfully");
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).send("Error sending notification");
  }
}
exports.enviarNotificacionComentariosRespuesta = async (req, res) => {
  const pushSubscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cG9WhFIPP3A:APA91bFZ5N5SGliIWMF3wjQdoUdXEgCduuLr2-GUXEan--zTbDbDGxvyzuc0yed1yYlxIXXTpU3_Q810k_n54ATbNpu-ux87i4c2_tq98UNIRDPGhKp6e8RyWXc7EGSgpXOEsTsgfkxL",
    keys: {
      p256dh:
        "BFYNEZ1MT-60MYXrHCw5yV5VpwRiwssxn6XBm_uYm3voHIgChwKvdOAejTAn3ICbSxM7jzb__PXmVeaq5t1W2Uw",
      auth: "WYqIQk0zn75glwwdWzPR4w",
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
  try {
    await enviarNotificacion(pushSubscription, payload);

    console.log("Notification sent successfully");
    res.status(200).send("Notification sent successfully");
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).send("Error sending notification");
  }
}
exports.enviarNotificacionProductosOfertas = async (req, res) => {
  const pushSubscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cG9WhFIPP3A:APA91bFZ5N5SGliIWMF3wjQdoUdXEgCduuLr2-GUXEan--zTbDbDGxvyzuc0yed1yYlxIXXTpU3_Q810k_n54ATbNpu-ux87i4c2_tq98UNIRDPGhKp6e8RyWXc7EGSgpXOEsTsgfkxL",
    keys: {
      p256dh:
        "BFYNEZ1MT-60MYXrHCw5yV5VpwRiwssxn6XBm_uYm3voHIgChwKvdOAejTAn3ICbSxM7jzb__PXmVeaq5t1W2Uw",
      auth: "WYqIQk0zn75glwwdWzPR4w",
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
  try {
    await enviarNotificacion(pushSubscription, payload);

    console.log("Notification sent successfully");
    res.status(200).send("Notification sent successfully");
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).send("Error sending notification");
  }
}
exports.enviarNotificacionBienvenidaAteleier = async (req, res) => {
  const pushSubscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cG9WhFIPP3A:APA91bFZ5N5SGliIWMF3wjQdoUdXEgCduuLr2-GUXEan--zTbDbDGxvyzuc0yed1yYlxIXXTpU3_Q810k_n54ATbNpu-ux87i4c2_tq98UNIRDPGhKp6e8RyWXc7EGSgpXOEsTsgfkxL",
    keys: {
      p256dh:
        "BFYNEZ1MT-60MYXrHCw5yV5VpwRiwssxn6XBm_uYm3voHIgChwKvdOAejTAn3ICbSxM7jzb__PXmVeaq5t1W2Uw",
      auth: "WYqIQk0zn75glwwdWzPR4w",
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
  try {
    await enviarNotificacion(pushSubscription, payload);

    console.log("Notification sent successfully");
    res.status(200).send("Notification sent successfully");
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).send("Error sending notification");
  }
}
exports.enviarNotificacionBienvenidaAteleierComprar = async (req, res) => {
  const pushSubscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cG9WhFIPP3A:APA91bFZ5N5SGliIWMF3wjQdoUdXEgCduuLr2-GUXEan--zTbDbDGxvyzuc0yed1yYlxIXXTpU3_Q810k_n54ATbNpu-ux87i4c2_tq98UNIRDPGhKp6e8RyWXc7EGSgpXOEsTsgfkxL",
    keys: {
      p256dh:
        "BFYNEZ1MT-60MYXrHCw5yV5VpwRiwssxn6XBm_uYm3voHIgChwKvdOAejTAn3ICbSxM7jzb__PXmVeaq5t1W2Uw",
      auth: "WYqIQk0zn75glwwdWzPR4w",
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
  try {
    await enviarNotificacion(pushSubscription, payload);

    console.log("Notification sent successfully");
    res.status(200).send("Notification sent successfully");
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).send("Error sending notification");
  }
}
exports.enviarNotificacionSuscripcion = async (req, res) => {
  const pushSubscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cG9WhFIPP3A:APA91bFZ5N5SGliIWMF3wjQdoUdXEgCduuLr2-GUXEan--zTbDbDGxvyzuc0yed1yYlxIXXTpU3_Q810k_n54ATbNpu-ux87i4c2_tq98UNIRDPGhKp6e8RyWXc7EGSgpXOEsTsgfkxL",
    keys: {
      p256dh:
        "BFYNEZ1MT-60MYXrHCw5yV5VpwRiwssxn6XBm_uYm3voHIgChwKvdOAejTAn3ICbSxM7jzb__PXmVeaq5t1W2Uw",
      auth: "WYqIQk0zn75glwwdWzPR4w",
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
  try {
    await enviarNotificacion(pushSubscription, payload);

    console.log("Notification sent successfully");
    res.status(200).send("Notification sent successfully");
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).send("Error sending notification");
  }
}
exports.enviarNotificacionSuscripcionRenovacion = async (req, res) => {
  const pushSubscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cG9WhFIPP3A:APA91bFZ5N5SGliIWMF3wjQdoUdXEgCduuLr2-GUXEan--zTbDbDGxvyzuc0yed1yYlxIXXTpU3_Q810k_n54ATbNpu-ux87i4c2_tq98UNIRDPGhKp6e8RyWXc7EGSgpXOEsTsgfkxL",
    keys: {
      p256dh:
        "BFYNEZ1MT-60MYXrHCw5yV5VpwRiwssxn6XBm_uYm3voHIgChwKvdOAejTAn3ICbSxM7jzb__PXmVeaq5t1W2Uw",
      auth: "WYqIQk0zn75glwwdWzPR4w",
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
  try {
    await enviarNotificacion(pushSubscription, payload);

    console.log("Notification sent successfully");
    res.status(200).send("Notification sent successfully");
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).send("Error sending notification");
  }
}
exports.enviarNotificacionNuevosProductosSuscriptores = async (req, res) => {
  const pushSubscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cG9WhFIPP3A:APA91bFZ5N5SGliIWMF3wjQdoUdXEgCduuLr2-GUXEan--zTbDbDGxvyzuc0yed1yYlxIXXTpU3_Q810k_n54ATbNpu-ux87i4c2_tq98UNIRDPGhKp6e8RyWXc7EGSgpXOEsTsgfkxL",
    keys: {
      p256dh:
        "BFYNEZ1MT-60MYXrHCw5yV5VpwRiwssxn6XBm_uYm3voHIgChwKvdOAejTAn3ICbSxM7jzb__PXmVeaq5t1W2Uw",
      auth: "WYqIQk0zn75glwwdWzPR4w",
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
  try {
    await enviarNotificacion(pushSubscription, payload);

    console.log("Notification sent successfully");
    res.status(200).send("Notification sent successfully");
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).send("Error sending notification");
  }
}
exports.enviarNotificacionRecordatorioDevolucionRenta = async (req, res) => {
  const pushSubscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cG9WhFIPP3A:APA91bFZ5N5SGliIWMF3wjQdoUdXEgCduuLr2-GUXEan--zTbDbDGxvyzuc0yed1yYlxIXXTpU3_Q810k_n54ATbNpu-ux87i4c2_tq98UNIRDPGhKp6e8RyWXc7EGSgpXOEsTsgfkxL",
    keys: {
      p256dh:
        "BFYNEZ1MT-60MYXrHCw5yV5VpwRiwssxn6XBm_uYm3voHIgChwKvdOAejTAn3ICbSxM7jzb__PXmVeaq5t1W2Uw",
      auth: "WYqIQk0zn75glwwdWzPR4w",
    },
  };

  const payload = {
    notification: {
      title: "¡Recordatorio de devolución de renta!",
      body: "Recuerda devolver el producto rentado antes de la fecha límite.",
      image:
        "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
      actions: [
        { action: "view_rental", title: "Ver Renta" },
        { action: "dismiss", title: "Descartar" },
      ],
      vibrate: [100, 50, 100],
    },
  };
  try {
    await enviarNotificacion(pushSubscription, payload);

    console.log("Notification sent successfully");
    res.status(200).send("Notification sent successfully");
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).send("Error sending notification");
  }
}
exports.enviarNotificacionAgradecimientoCompra = async (req, res) => {
  const pushSubscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cG9WhFIPP3A:APA91bFZ5N5SGliIWMF3wjQdoUdXEgCduuLr2-GUXEan--zTbDbDGxvyzuc0yed1yYlxIXXTpU3_Q810k_n54ATbNpu-ux87i4c2_tq98UNIRDPGhKp6e8RyWXc7EGSgpXOEsTsgfkxL",
    keys: {
      p256dh:
        "BFYNEZ1MT-60MYXrHCw5yV5VpwRiwssxn6XBm_uYm3voHIgChwKvdOAejTAn3ICbSxM7jzb__PXmVeaq5t1W2Uw",
      auth: "WYqIQk0zn75glwwdWzPR4w",
    },
  };

  const payload = {
    notification: {
      title: "¡Gracias por tu compra!",
      body: "Esperamos que disfrutes de tu producto. ¡Vuelve pronto!",
      image:
        "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
      actions: [
        { action: "view_order", title: "Ver Pedido" },
        { action: "dismiss", title: "Descartar" },
      ],
      vibrate: [100, 50, 100],
    },
  };
  try {
    await enviarNotificacion(pushSubscription, payload);

    console.log("Notification sent successfully");
    res.status(200).send("Notification sent successfully");
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).send("Error sending notification");
  }
}
exports.enviarNotificacionLlevateCarrito = async (req, res) => {
  console.log("llego")
  const pushSubscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cG9WhFIPP3A:APA91bFZ5N5SGliIWMF3wjQdoUdXEgCduuLr2-GUXEan--zTbDbDGxvyzuc0yed1yYlxIXXTpU3_Q810k_n54ATbNpu-ux87i4c2_tq98UNIRDPGhKp6e8RyWXc7EGSgpXOEsTsgfkxL",
    keys: {
      p256dh:
        "BFYNEZ1MT-60MYXrHCw5yV5VpwRiwssxn6XBm_uYm3voHIgChwKvdOAejTAn3ICbSxM7jzb__PXmVeaq5t1W2Uw",
      auth: "WYqIQk0zn75glwwdWzPR4w",
    },
  };

  const payload = {
    notification: {
      title: "¡No olvides tu carrito!",
      body: "Tienes productos en tu carrito. ¡Completa tu compra ahora!",
      image:
        "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
      actions: [
        { action: "view_cart", title: "Ver Carrito" },
        { action: "dismiss", title: "Descartar" },
      ],
      vibrate: [100, 50, 100],
    },
  };
  try {
    await enviarNotificacion(pushSubscription, payload);

    console.log("Notification sent successfully");
    res.status(200).send("Notification sent successfully");
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).send("Error sending notification");
  }
  
}
exports.enviarNotificacionRentaExtendida = async (req, res) => {
  const pushSubscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cG9WhFIPP3A:APA91bFZ5N5SGliIWMF3wjQdoUdXEgCduuLr2-GUXEan--zTbDbDGxvyzuc0yed1yYlxIXXTpU3_Q810k_n54ATbNpu-ux87i4c2_tq98UNIRDPGhKp6e8RyWXc7EGSgpXOEsTsgfkxL",
    keys: {
      p256dh:
        "BFYNEZ1MT-60MYXrHCw5yV5VpwRiwssxn6XBm_uYm3voHIgChwKvdOAejTAn3ICbSxM7jzb__PXmVeaq5t1W2Uw",
      auth: "WYqIQk0zn75glwwdWzPR4w",
    },
  };

  const payload = {
    notification: {
      title: "¡Renta extendida!",
      body: "Tu periodo de renta ha sido extendido. Disfruta más tiempo con tu producto.",
      image:
        "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
      actions: [
        { action: "view_rental", title: "Ver Renta" },
        { action: "dismiss", title: "Descartar" },
      ],
      vibrate: [100, 50, 100],
    },
  };
}
exports.enviarNotificacionMotivacionRenta = async (req, res) => {
  const pushSubscription = {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/cG9WhFIPP3A:APA91bFZ5N5SGliIWMF3wjQdoUdXEgCduuLr2-GUXEan--zTbDbDGxvyzuc0yed1yYlxIXXTpU3_Q810k_n54ATbNpu-ux87i4c2_tq98UNIRDPGhKp6e8RyWXc7EGSgpXOEsTsgfkxL",
    keys: {
      p256dh:
        "BFYNEZ1MT-60MYXrHCw5yV5VpwRiwssxn6XBm_uYm3voHIgChwKvdOAejTAn3ICbSxM7jzb__PXmVeaq5t1W2Uw",
      auth: "WYqIQk0zn75glwwdWzPR4w",
    },
  };

  const payload = {
    notification: {
      title: "¡Motivación para rentar!",
      body: "Explora nuestros productos y aprovecha nuestras ofertas de renta.",
      image:
        "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg",
      actions: [
        { action: "explore_rentals", title: "Explorar Rentas" },
        { action: "dismiss", title: "Descartar" },
      ],
      vibrate: [100, 50, 100],
    },
  };
  try {
    await enviarNotificacion(pushSubscription, payload);

    console.log("Notification sent successfully");
    res.status(200).send("Notification sent successfully");
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).send("Error sending notification");
  }
}