const express = require("express");
const router = express.Router();
const {
  PoliticaController,
  TerminosController,
  DeslindeController
} = require("../Controllers/PrivadoController");
// const authWithRole = require("../middleware/auth");

// ✅ Rutas públicas
router.get("/obtenerTerminosYCondiciones", TerminosController.obtenerTerminosYCondiciones);
router.get("/obtenerTerminosYCondicionesVigentes", TerminosController.obtenerTerminosYCondicionesVigentes);
router.get("/obtenerPoliticas", PoliticaController.obtenerPoliticas);
router.get("/obtenerDeslindesLegales", DeslindeController.obtenerDeslindesLegales);

// ✅ Rutas protegidas (solo ADMIN)
// router.use(authWithRole(['TITULAR']));

// Términos y condiciones (privadas)
router.post("/crearTerminosYCondiciones", TerminosController.crearTerminosYCondiciones);
router.put("/actualizarTerminosYCondiciones/:id", TerminosController.actualizarTerminosYCondiciones);
router.delete("/eliminarTerminosYCondiciones/:id", TerminosController.eliminarTerminosYCondiciones);
router.get("/obtenerHistorialTerminosYCondiciones/:id", TerminosController.obtenerHistorialTerminosYCondiciones);

// Políticas (privadas)
router.post("/crearPoliticas", PoliticaController.crearPoliticas);
router.put("/actualizarPoliticas/:id", PoliticaController.actualizarPoliticas);
router.delete("/eliminarPolitica/:id", PoliticaController.eliminarPolitica);
router.get("/obtenerHistorialPoliticas/:id", PoliticaController.obtenerHistorialPolitica);

// Deslinde legal (privadas)
router.post("/crearDeslindeLegal", DeslindeController.crearDeslindeLegal);
router.put("/actualizarDeslindeLegal/:id", DeslindeController.actualizarDeslindeLegal);
router.delete("/eliminarDeslindeLegal/:id", DeslindeController.eliminarDeslindeLegal);
router.get("/obtenerHistorialDeslindeLegal/:id", DeslindeController.obtenerHistorialDeslindeLegal);

module.exports = router;
