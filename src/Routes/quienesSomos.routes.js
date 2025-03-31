const express = require("express");
const router = express.Router();
const quienesSomos = require("../Controllers/quienesSomos.model");
const {
  misionSchema,
  objectIdSchema,
  preguntaFrecuenteSchema,
  preguntasQuerySchema,
  valorSchema,
  visionSchema,
} = require("../schemas/quienesSomos");
const validarDatos = require("../Midlewares/validator.middleware"); // Corregí "Midlewares" a "Middlewares"

// Rutas para Misión
router.get("/mision", quienesSomos.getMision);
router.post(
  "/mision",
  //  validarDatos(misionSchema),
  quienesSomos.saveMision
);
router.post(
  "/mision",
  //  validarDatos(misionSchema),
  quienesSomos.saveMision
);
router.delete("/mision/delete/:id", quienesSomos.deleteMision);

// Rutas para Visión
router.get("/vision", quienesSomos.getVision);
router.post(
  "/vision",
  // validarDatos(visionSchema),
  quienesSomos.saveVision
);
router.delete("/vision/delete/:id", quienesSomos.deleteVision);

// Rutas para Valores
router.get("/valores", quienesSomos.getValores);
router.get("/valores/all", quienesSomos.getAllValores); // Admin
router.post("/valores", quienesSomos.createValor);
router.put("/valores/:id", quienesSomos.updateValor);
router.delete(
  "/valores/:id",
  // validarDatos(objectIdSchema, "params"),
  quienesSomos.deleteValor
);

// Rutas para Preguntas Frecuentes
router.get(
  "/preguntas-frecuentes",
  // validarDatos(preguntasQuerySchema, "query"), // Validar query params
  quienesSomos.getPreguntas
);
router.get("/preguntas-frecuentes/all", quienesSomos.getAllPreguntas); // Admin
router.post(
  "/preguntas-frecuentes",
  // validarDatos(preguntaFrecuenteSchema),
  quienesSomos.createPregunta
);
router.put(
  "/preguntas-frecuentes/:id",
  // validarDatos(objectIdSchema, "params"), // Validar ID
  // validarDatos(preguntaFrecuenteSchema), // Validar body
  quienesSomos.updatePregunta
);
router.delete(
  "/preguntas-frecuentes/:id",
  // validarDatos(objectIdSchema, "params"),
  quienesSomos.deletePregunta
);

module.exports = router;
