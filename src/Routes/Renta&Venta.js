const express = require("express");
const router = express.Router();

// const NotificacionController = require("../Controllers/NotificacionController.js");
const VentaController = require("../Controllers/VentaController.js"); // Importar el controlador para venta, renta y compra
const RentaController = require("../Controllers/RentaController.js"); // Importar el controlador para venta, renta y compra

// // Rutas de notificación
// router.post("/", NotificacionController.enviarNotificacionyCuerpo);
// router.post("/revisar-correo", NotificacionController.enviarNotificacionCorreo);

// // Rutas para venta, renta y compra
router.get("/comprasByidUser/:usuarioId", VentaController.obtenerProductosCompradoByIdUser);
router.post("/crearVenta", VentaController.crearVenta);
router.post("/crearRenta", RentaController.crearRenta);
router.get("/rentasByidUser/:usuarioId", RentaController.obtenerProductosRentadosByIdUser);
router.get("/obtenerVentas/", VentaController.obtenerVentas);
router.get("/obtenerRentas/", RentaController.obtenerRentas);
router.delete("/rentaId/:id", RentaController.elimininarById);
router.delete("/ventaId/:id", VentaController.elimininarById);
router.put("/actualizarRenta/:id", RentaController.actualizarRentaById);
router.put("/actualizarVenta/:id", VentaController.actualizarVentaById);
router.get("/rentaById/:id", RentaController.obtenerRentaById);
router.get("/ventaById/:id", VentaController.elimininarById);
// router.get("/rentaByIdUser/:id", RentaController.obtenerRentaByIdUser);
router.get("/ventaByIdUser/:id", VentaController.obtenerVentaByIdUser);
router.get("/rentaByIdProducto/:id", RentaController.obtenerRentaByIdProducto);
router.get("/ventaByIdProducto/:id", VentaController.obtenerVentaByIdProducto);
router.get("/rentaByIdEstado/:id", RentaController.obtenerRentaByIdEstado);
router.get("/ventaByIdEstado/:id", VentaController.obtenerVentaByIdEstado);
router.delete("renntasSeleccionadas", RentaController.eliminarRentasSeleccionadas);
router.delete("ventasSeleccionadas", VentaController.eliminarVentasSeleccionadas);


// router.post("/realizarRenta", VentaRentaController.crearCompra); // Ruta para compra
// router.post("/realizarCompra", VentaRentaController.crearCompra); // Ruta para compra
// router.get("/estado/:id", VentaRentaController.revisarEstado);

module.exports = router;
