const express = require("express");
const router = express.Router();
const {
  crearRelacion,
  obtenerRelaciones,
  eliminarRelacion,
  obtenerRelacionPorId,
} = require("../Controllers/VestidoAccesorioController"); // Asegúrate de que la ruta sea correcta

// Ruta para crear una nueva relación entre un vestido y sus accesorios
router.post("/", crearRelacion);

// Ruta para obtener todas las relaciones de vestidos y accesorios
router.get("/", obtenerRelaciones);

// Ruta para obtener una relación específica por ID
router.get("/:id", obtenerRelacionPorId);

// Ruta para eliminar una relación específica por ID
router.delete("/:id", eliminarRelacion);

module.exports = router;
