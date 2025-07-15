const express = require("express");
const dashboardController
    = require("../Controllers/EstadisticasController.js");

const router = express.Router();

// Rutas separadas por sección
// router.get('/obtenerResumenGeneral', dashboardController.obtenerResumenGeneral);
router.get('/obtenerTotalesRentaVenta', dashboardController.obtenerResumenDashboard);
// router.get('/obtenerCantidadVestidosVendidosYRentados', dashboardController.obtenerCantidadVestidosVendidosYRentados);


module.exports = router;
