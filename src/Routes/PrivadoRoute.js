const express = require("express");
const router = express.Router();

const {
  actualizarPoliticas,
  crearPoliticas,
  obtenerPoliticas,
  eliminarPolitica,
  obtenerHistorialPolitica,
} = require("../Controllers/PrivadoController");

router.post("/crearPoliticas", crearPoliticas);
router.get("/obtenerPoliticas", obtenerPoliticas);
router.get("/obtenerHistorialPoliticas/:id", obtenerHistorialPolitica);
router.put("/actualizarPoliticas/:id", actualizarPoliticas);
// Eliminar un perfil de empresa
router.delete("/eliminarPolitica/:id", eliminarPolitica);

module.exports = router;
