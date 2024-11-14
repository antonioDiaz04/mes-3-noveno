const webpush = require("web-push");
const vapidKeys = {
  publicKey:
    "BPqUE0OuQtFwPMDzFFttBK-aM3oJePkk_vsQ0OPmRQVJwWYQY1gq1U7mxFPRuSUR85rwBiU1ynfCsExlCIt40fk",

  privateKey: "UJjeVqP6X5M9EyNLILT4dxYG1TAz2yCaWfBwkOFr2io",
};

webpush.setVapidDetails(
  "mailto:20221136@uthh.edu.mx",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

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
    const response = await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );
    console.log("Notification sent successfully");
    res.status(200).send("Notification sent successfully");
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).send("Error sending notification");
  }
};
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
    const response = await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );
    console.log("Notification sent successfully");
    // Enviar la respuesta como JSON
    res.status(200).json({ msg: "Notification sent successfully" });
  } catch (err) {
    console.error("Error sending notification", err);
    res.status(500).json({ msg: "Error sending notification" });
  }
};
