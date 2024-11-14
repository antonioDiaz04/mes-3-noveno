const express = require("express");
const router = express.Router();

const PrivadoController = require("../Controllers/PrivadoController");

router.post("/", PrivadoController.crearPoliticas);
router.get("/", PrivadoController.obtenerPoliticas);
router.put("/", PrivadoController.actualizarPoliticas);

module.exports = router;

