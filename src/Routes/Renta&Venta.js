const express = require("express");
const router = express.Router();

// const NotificacionController = require("../Controllers/NotificacionController.js");
// const VentaRentaController = require("../Controllers/RentaController.js"); // Importar el controlador para venta, renta y compra

// // Rutas de notificación
// router.post("/", NotificacionController.enviarNotificacionyCuerpo);
// router.post("/revisar-correo", NotificacionController.enviarNotificacionCorreo);

// // Rutas para venta, renta y compra
// router.post("/vender", VentaRentaController.crearVenta);
// router.post("/rentar", VentaRentaController.crearRenta);
// router.post("/comprar", VentaRentaController.crearCompra); // Ruta para compra
// router.get("/estado/:id", VentaRentaController.revisarEstado);

module.exports = router;
