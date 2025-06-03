const express = require("express");
const router = express.Router();

const NotificacionController = require("../Controllers/NotificacionController.js");

router.post("/lleva-producto", NotificacionController.llevateTuProducto);
router.post("/ejemplo", NotificacionController.enviarNotificacion);
router.post("/", NotificacionController.enviarNotificacionyCuerpo);
router.post("/enviar-notificacion", NotificacionController.enviarNotificacion);
router.post("/llevate-carrito", NotificacionController.enviarNotificacionLlevateCarrito); // Nueva ruta para enviar notificación de nuevos productos
router.post("/revisar-correo", NotificacionController.enviarNotificacionCorreo);
router.post("/enviar-notificacion-nuevos-productos", NotificacionController.enviarNotificacionNuevosProductos); // Nueva ruta para enviar notificación de nuevos productos
router.post("/enviar-notificacion-comentarios", NotificacionController.enviarNotificacionComentarios); // Nueva ruta para enviar notificación de nuevos productos
router.post("/enviar-notificacion-comentarios-respuesta", NotificacionController.enviarNotificacionComentariosRespuesta); // Nueva ruta para enviar notificación de nuevos productos
router.post("/productos-ofertas", NotificacionController.enviarNotificacionProductosOfertas); // Nueva ruta para enviar notificación de nuevos productos
router.post("/bienvenida-ateleier-ventayrenta", NotificacionController.enviarNotificacionBienvenidaAteleier); // Nueva ruta para enviar notificación de nuevos productos
router.post("/bienvenida-ateleier-comprar", NotificacionController.enviarNotificacionBienvenidaAteleierComprar); // Nueva ruta para enviar notificación de nuevos productos
router.post("/notificacion-subscripcion", NotificacionController.enviarNotificacionSuscripcion); // Nueva ruta para enviar notificación de nuevos productos
router.post("/notificacion-subscripcion-renovacion", NotificacionController.enviarNotificacionSuscripcionRenovacion); // Nueva ruta para enviar notificación de nuevos productos
router.post("/nuevos-productos-subscriptores", NotificacionController.enviarNotificacionNuevosProductosSuscriptores); // Nueva ruta para enviar notificación de nuevos productos
router.post("/agradecimiento-compra", NotificacionController.enviarNotificacionAgradecimientoCompra); // Nueva ruta para enviar notificación de nuevos productos
router.post("/renta-extendida", NotificacionController.enviarNotificacionRentaExtendida); // Nueva ruta para enviar notificación de nuevos productos
router.post("/recordatorio-devolucion-renta", NotificacionController.enviarNotificacionRecordatorioDevolucionRenta); // Nueva ruta para enviar notificación de nuevos productos
router.post("/motivacion-renta", NotificacionController.enviarNotificacionMotivacionRenta); // Nueva ruta para enviar notificación de nuevos productos
module.exports = router;
