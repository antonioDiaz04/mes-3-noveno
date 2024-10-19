const express = require("express");
const router = express.Router();

const PrivadoController = require("../Controllers/PrivadoController");

router.post("/politica", PrivadoController.crearPoliticas);
router.get("/politicas", PrivadoController.obtenerPoliticas);
router.put("/politica", PrivadoController.actualizarPoliticas);

module.exports = router;

