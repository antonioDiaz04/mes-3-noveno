const express = require("express");
const dashboardController
    = require("../Controllers/EstadisticasController.js");

const router = express.Router();

// Rutas separadas por sección
router.get('/resumen/ventas', dashboardController.obtenerResumenVentas);
router.get('/resumen/rentas', dashboardController.obtenerResumenRentas);
router.get('/resumen/clientes', dashboardController.obtenerClientesUnicos);
router.get('/resumen/productos-mas-vendidos', dashboardController.obtenerProductosMasVendidos);
router.get('/resumen/graficas', dashboardController.obtenerDatosGraficos);

module.exports = router;
