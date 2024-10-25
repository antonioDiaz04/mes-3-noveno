const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const {
  crearPerfilEmpresa,
  obtenerPerfilesEmpresa,
  editarPerfilEmpresa,eliminarAuditoria
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

router.put(
  "/editarPerfilEmpresa",
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  }),
  editarPerfilEmpresa
);


module.exports = router;
