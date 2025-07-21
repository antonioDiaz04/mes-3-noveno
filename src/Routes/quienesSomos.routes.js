const express = require("express");
const router = express.Router();
const quienesSomos = require("../Controllers/quienesSomos.model");





//* ==================================================
//* ✅ RUTAS PÚBLICAS
//* ==================================================

// Misión
router.get("/mision", quienesSomos.getMision);

// Visión
router.get("/vision", quienesSomos.getVision);

// Valores
router.get("/valores", quienesSomos.getValores);

// Preguntas Frecuentes
router.get("/preguntas-frecuentes", quienesSomos.getPreguntas);

//* ==================================================
//* 🔒 RUTAS ADMINISTRATIVAS (Privadas)
//* ==================================================

// 🟩 Misión
router.post("/mision", quienesSomos.saveMision);
router.put("/mision/:id", quienesSomos.saveMision);
router.delete("/mision/:id", quienesSomos.deleteMision);

// 🟦 Visión
router.post("/vision", quienesSomos.saveVision);
router.delete("/vision/:id", quienesSomos.deleteVision);

// 🟪 Valores
router.get("/valores/all", quienesSomos.getAllValores);
router.post("/valores", quienesSomos.createValor);
router.put("/valores/:id", quienesSomos.updateValor);
router.delete("/valores/:id", quienesSomos.deleteValor);

// 🟨 Preguntas Frecuentes
router.get("/preguntas-frecuentes/all", quienesSomos.getAllPreguntas);
router.post("/preguntas-frecuentes", quienesSomos.createPregunta);
router.put("/preguntas-frecuentes/:id", quienesSomos.updatePregunta);
router.post("/preguntas-registrar", quienesSomos.registrarPreguntasFrecuentes);
router.delete("/preguntas-frecuentes/:id", quienesSomos.deletePregunta);

module.exports = router;
