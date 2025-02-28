const express = require("express");
const {
  // obtenerEstadisticas,
  obtenerTotales,
  obtenerIngresosTotales,
  obtenerProductosPopulares,
  obtenerClientesActivos,
  obtenerIngresosPorMes,
  obtenerMetodosPago,
  obtenerRentasRetrasadas,
  obtenerClientesFrecuentes,
  obtenerGastoPromedio
} = require("../Controllers/EstadisticasController.js");

const router = express.Router();

// router.get("/", obtenerEstadisticas);
router.get("/totales", obtenerTotales);
router.get("/ingresos", obtenerIngresosTotales);
router.get("/productos-populares", obtenerProductosPopulares);
router.get("/clientes-activos", obtenerClientesActivos);
router.get("/ingresos-mensuales", obtenerIngresosPorMes);
router.get("/metodos-pago", obtenerMetodosPago);
router.get("/rentas-retrasadas", obtenerRentasRetrasadas);
router.get("/clientes-frecuentes", obtenerClientesFrecuentes);
router.get("/gasto-promedio", obtenerGastoPromedio);

module.exports = router;
