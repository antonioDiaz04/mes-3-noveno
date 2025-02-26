const express = require("express");
const router = express.Router();
const {
  actualizarPoliticas,
  crearPoliticas,
  obtenerPoliticas,
  eliminarPolitica,
  obtenerHistorialPolitica,
} = require("../Controllers/PrivadoController");

const {
  crearTerminosYCondiciones,
  actualizarTerminosYCondiciones,
  obtenerTerminosYCondiciones,
  eliminarTerminosYCondiciones,
  obtenerHistorialTerminosYCondiciones,
  obtenerTerminosYCondicionesVigentes,
} = require("../Controllers/PrivadoController");
const {
  crearDeslindeLegal,
  actualizarDeslindeLegal,
  eliminarDeslindeLegal,
  obtenerDeslindesLegales,
  obtenerHistorialDeslindeLegal,
} = require("../Controllers/PrivadoController");
const validarDatos = require("../Midlewares/validator.middleware");
const { DocumentosLegales } = require("../schemas/authSchema");

// Terminos y condiciones
router.get("/obtenerTerminosYCondiciones", obtenerTerminosYCondiciones);
router.get(
  "/obtenerHistorialTerminosYCondiciones/:id",
  obtenerHistorialTerminosYCondiciones
);
router.get(
  "/obtenerTerminosYCondicionesVigentes",
  obtenerTerminosYCondicionesVigentes
);
router.post(
  "/crearTerminosYCondiciones",
  validarDatos(DocumentosLegales),
  crearTerminosYCondiciones
);
router.put(
  "/actualizarTerminosYCondiciones/:id",
  actualizarTerminosYCondiciones
);
router.delete(
  "/eliminarTerminosYCondiciones/:id",
  eliminarTerminosYCondiciones
);

// Rutas para Politicas
router.post("/crearPoliticas", validarDatos(DocumentosLegales), crearPoliticas);
router.get("/obtenerPoliticas", obtenerPoliticas);
router.put("/actualizarPoliticas/:id", actualizarPoliticas);
router.delete("/eliminarPolitica/:id", eliminarPolitica);
router.get("/obtenerHistorialPoliticas/:id", obtenerHistorialPolitica);

// Rutas para Deslinde Legal
router.post(
  "/crearDeslindeLegal",
  validarDatos(DocumentosLegales),
  crearDeslindeLegal
);
router.get("/obtenerDeslindesLegales", obtenerDeslindesLegales);
router.put("/actualizarDeslindeLegal/:id", actualizarDeslindeLegal);
router.delete("/eliminarDeslindeLegal/:id", eliminarDeslindeLegal);
router.get("/obtenerHistorialDeslindeLegal/:id", obtenerHistorialDeslindeLegal);

module.exports = router;
