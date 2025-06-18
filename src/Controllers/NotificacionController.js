const webpush = require('web-push');
const Notificacion = require('../Models/NotificacionModel.js');
const Suscripcion = require('../Models/Suscripcion.js');
const {
  tiposNotificacion,
  prioridadesNotificacion,
  mensajesNotificacion
} = require('../config/notificaciones.config');

const imagenDefault = "https://scontent.fver2-1.fna.fbcdn.net/v/t39.30808-6/428626270_122131445744124868_2285920480645454536_n.jpg"; // Imagen por defecto para notificaciones
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

    const existente = await Suscripcion.findOne({ endpoint: token.endpoint });
    if (!existente) {
        await Suscripcion.create({
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
        res.status(400).json({ message: err.message || "Error interno" });
    }
};

exports.enviarNotificacionLlevateCarrito = async (req, res) => {
    try {
        const { token, userId, email } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token de suscripción no proporcionado"
            });
        }

        if (!token.endpoint || !token.keys || !token.keys.auth || !token.keys.p256dh) {
            return res.status(400).json({
                success: false,
                message: "Estructura del token inválida"
            });
        }

        const resultado = await enviarNotificacionPushGenerica({
            token,
            userId,
            email,
            titulo: "¡Llévate tu carrito!",
            cuerpo: "Tu carrito está listo para ser revisado. ¡No te lo pierdas!",
            tipo: "alerta",
            image: imagenDefault,
            actions: [
                { action: "view_cart", title: "Ver Carrito", icon: "/icons/cart.png" },
                { action: "dismiss", title: "Descartar", icon: "/icons/close.png" }
            ],
            vibrate: [100, 50, 100]
        });

        res.status(200).json({
            success: true,
            message: "Notificación enviada con éxito",
            data: resultado
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error al enviar la notificación",
            error: err.message
        });
    }
};








exports.enviarNotificacionRecordatorioDevolucionRenta = async (req, res) => {
    try {
        const { token, userId, email } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token de suscripción no proporcionado"
            });
        }

        if (!token.endpoint || !token.keys || !token.keys.auth || !token.keys.p256dh) {
            return res.status(400).json({
                success: false,
                message: "Estructura del token inválida"
            });
        }

        const resultado = await enviarNotificacionPushGenerica({
            token,
            userId,
            email,
            titulo: "Recordatorio de Devolución",
            cuerpo: "Recuerda devolver el producto rentado antes de la fecha límite.",
            tipo: "advertencia",
            image: imagenDefault,
            actions: [
                { action: "view_rental", title: "Ver Renta", icon: "/icons/rental.png" },
                { action: "dismiss", title: "Descartar", icon: "/icons/close.png" }
            ],
            vibrate: [100, 50, 100]
        });

        res.status(200).json({
            success: true,
            message: "Notificación enviada con éxito",
            data: resultado
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error al enviar la notificación",
            error: err.message
        });
    }
}


async function enviarNotificacionPushGenerica({ token, userId, email, titulo, cuerpo, tipo = 'info', image, actions = [], vibrate }) {
    let tokenData;

    try {
        console.log('➡️ Iniciando lógica para enviar notificación push genérica');

        tokenData = typeof token === 'string' ? JSON.parse(token) : token;

        if (!tokenData.endpoint || !tokenData.keys || !tokenData.keys.auth || !tokenData.keys.p256dh) {
            throw new Error("Estructura del token inválida");
        }

        const suscripcionData = {
            userId: userId || null,
            email: email || null,
            endpoint: tokenData.endpoint,
            p256dh: tokenData.keys.p256dh,
            auth: tokenData.keys.auth
        };

        console.log('📩 Guardando/actualizando suscripción');
        const suscripcion = await Suscripcion.findOneAndUpdate(
            { endpoint: tokenData.endpoint },
            suscripcionData,
            { upsert: true, new: true }
        );

        const pushSubscription = {
            endpoint: tokenData.endpoint,
            keys: {
                p256dh: tokenData.keys.p256dh,
                auth: tokenData.keys.auth
            }
        };

        // const tipoConfig = tiposNotificacion[tipo] || tiposNotificacion['info'];
        const tipoConfig = tiposNotificacion[tipo] ?? tiposNotificacion['info'] ?? { icon: 'ℹ️', vibrate: [100, 50, 100] };

        const payload = {
            notification: {
                title: titulo,
                body: cuerpo,
                icon: tipoConfig.icon,
                image: image || null,
                actions,
                vibrate: vibrate || tipoConfig.vibrate,
                data: {
                    tipo,
                    userId: userId || null,
                    timestamp: new Date().toISOString()
                }
            }
        };

        console.log('📤 Enviando notificación push');
        await webpush.sendNotification(pushSubscription, JSON.stringify(payload));

        console.log('📝 Registrando notificación en la base de datos');
        const notificacion = await Notificacion.create({
            usuario: userId,
            titulo,
            contenido: cuerpo,
            tipo,
            datosAdicionales: {
                icon: tipoConfig.icon,
                image,
                actions,
                vibrate: vibrate || tipoConfig.vibrate
            }
        });

        console.log('✅ Notificación enviada correctamente');
        return {
            suscripcionId: suscripcion._id,
            notificacionId: notificacion._id
        };

    } catch (error) {
        console.error("❌ Error en enviarNotificacionPushGenerica:", error);

        if (error.statusCode === 410 && tokenData?.endpoint) {
            await Suscripcion.deleteOne({ endpoint: tokenData.endpoint });
            console.log("🗑️ Suscripción eliminada por ser inválida");
        }

        throw error;
    }
}



exports.obtenerNotificacionesByUserId=async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario no proporcionado"
            });
        }

        const notificaciones = await Notificacion.find({ usuario: userId }).sort({ fecha: -1 });

        if (notificaciones.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No se encontraron notificaciones para este usuario"
            });
        }

        res.status(200).json({
            success: true,
            data: notificaciones
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error al obtener las notificaciones",
            error: err.message
        });
    }
}