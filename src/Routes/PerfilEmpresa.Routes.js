const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const {crearEntrada,obtenerEntradas,editarEntrada,eliminarEntrada,
  crearPerfilEmpresa,
  obtenerPerfilesEmpresa,
  editarPerfilEmpresa,
  guardarRedSocial,
  obtenerRedesSociales,
  eliminarAuditoria,
  eliminarRedSocial,editarConfigurarEmpresa,consultarConfigurarEmpresa
} = require("../Controllers/EmpresaController.js");

router.post(
  "/crearPerfilEmpresa",

  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  }),
  crearPerfilEmpresa
);

// Obtener todos los perfiles de empresa
router.get("/obtenerPerfilesEmpresa", obtenerPerfilesEmpresa);
router.get("/obtenerRedesSociales", obtenerRedesSociales);
router.get("/consultarConfigurarEmpresa", consultarConfigurarEmpresa);
router.post("/guardarRedSocial/:id", guardarRedSocial);
// router.put("/configurarEmpresa/", editarConfigurarEmpresa);

router.put(
  "/editarPerfilEmpresa",
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  }),
  editarPerfilEmpresa
);
router.put("/editarConfigurarEmpresa", editarConfigurarEmpresa);
router.delete("/eliminarRedSocial/:id", eliminarRedSocial);

// ✅ Crear una nueva entrada (Misión, Visión o Valores)
router.post("/", crearEntrada);

// ✅ Obtener todas las entradas por tipo
router.get("/:tipo", obtenerEntradas);

// ✅ Editar una entrada por ID
router.put("/:id", editarEntrada);

// ✅ Eliminar una entrada por ID
router.delete("/:id", eliminarEntrada);

// preguntas

// // ✅ Crear una nueva pregunta frecuente
// router.post("/preguntas-frecuentes", crearPreguntaFrecuente);

// // ✅ Obtener todas las preguntas frecuentes
// router.get("/preguntas-frecuentes", obtenerPreguntasFrecuentes);

// // ✅ Editar una pregunta frecuente por ID
// router.put("/preguntas-frecuentes/:id", editarPreguntaFrecuente);

// // ✅ Eliminar una pregunta frecuente por ID
// router.delete("/preguntas-frecuentes/:id", eliminarPreguntaFrecuente);








module.exports = router;
