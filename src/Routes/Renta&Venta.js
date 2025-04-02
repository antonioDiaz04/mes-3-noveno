const express = require("express");
const router = express.Router();

// const NotificacionController = require("../Controllers/NotificacionController.js");
const VentaController = require("../Controllers/VentaController.js"); // Importar el controlador para venta, renta y compra
const RentaController = require("../Controllers/RentaController.js"); // Importar el controlador para venta, renta y compra

// // Rutas de notificación
// router.post("/", NotificacionController.enviarNotificacionyCuerpo);
// router.post("/revisar-correo", NotificacionController.enviarNotificacionCorreo);

// // Rutas para venta, renta y compra
// Rutas para editar una renta
router.get('/estadisticas-rentas', RentaController.generarEstadisticasRentas);
router.put("/editarRenta/:rentaId", RentaController.editarRenta);
router.get("/comprasByidUser/:usuarioId", VentaController.obtenerProductosCompradoByIdUser);
router.post("/crearVenta", VentaController.crearVenta);
router.post("/crearRenta", RentaController.crearRenta);
router.get("/rentasByidUser/:usuarioId", RentaController.obtenerProductosRentadosByIdUser);
router.get("/obtenerVentas/", VentaController.obtenerVentas);
router.get("/obtenerRentas/", RentaController.obtenerRentas);
// router.post("/realizarRenta", VentaRentaController.crearCompra); // Ruta para compra
// router.post("/realizarCompra", VentaRentaController.crearCompra); // Ruta para compra
// router.get("/estado/:id", VentaRentaController.revisarEstado);

module.exports = router;
