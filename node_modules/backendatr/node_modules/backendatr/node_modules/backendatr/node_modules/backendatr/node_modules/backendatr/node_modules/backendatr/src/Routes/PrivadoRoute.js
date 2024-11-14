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
  obtenerHistorialTerminosYCondiciones,obtenerTerminosYCondicionesVigentes,
} = require("../Controllers/PrivadoController");
const {
crearDeslindeLegal,actualizarDeslindeLegal,eliminarDeslindeLegal,obtenerDeslindesLegales,obtenerHistorialDeslindeLegal
} = require("../Controllers/PrivadoController");

router.get("/obtenerPoliticas", obtenerPoliticas);
router.get("/obtenerTerminosYCondiciones", obtenerTerminosYCondiciones);
router.get(
  "/obtenerHistorialTerminosYCondiciones/:id",
  obtenerHistorialTerminosYCondiciones
);
router.get("/obtenerHistorialPoliticas/:id", obtenerHistorialPolitica);
router.get("/obtenerTerminosYCondicionesVigentes", obtenerTerminosYCondicionesVigentes);

router.post("/crearPoliticas", crearPoliticas);

router.post("/crearTerminosYCondiciones", crearTerminosYCondiciones);
router.put("/actualizarPoliticas/:id", actualizarPoliticas);

router.put(
  "/actualizarTerminosYCondiciones/:id",
  actualizarTerminosYCondiciones
);
router.delete("/eliminarPolitica/:id", eliminarPolitica);



router.delete(
  "/eliminarTerminosYCondiciones/:id",
  eliminarTerminosYCondiciones
);


// Rutas para Deslinde Legal
router.get("/obtenerDeslindesLegales", obtenerDeslindesLegales);
router.post("/crearDeslindeLegal", crearDeslindeLegal);
router.put("/actualizarDeslindeLegal/:id", actualizarDeslindeLegal);
router.delete("/eliminarDeslindeLegal/:id", eliminarDeslindeLegal);
router.get("/obtenerHistorialDeslindeLegal/:id", obtenerHistorialDeslindeLegal);

module.exports = router;
