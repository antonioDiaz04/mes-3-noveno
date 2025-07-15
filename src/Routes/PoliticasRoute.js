const express = require("express");
const router = express.Router();

const { PoliticaController } = require("../Controllers/PrivadoController");

router.post("/", PoliticaController.crearPoliticas);
router.get("/", PoliticaController.obtenerPoliticas);
router.put("/", PoliticaController.actualizarPoliticas);

module.exports = router;
