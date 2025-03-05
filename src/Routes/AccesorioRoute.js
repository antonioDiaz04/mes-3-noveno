const express = require("express");
const router = express.Router();
const upload = require("../Midlewares/multer");
const AccesorioController = require("../Controllers/AccesorioController");

// Configuración de las rutas
router.post(
  "/",
  upload.single("imagenPrincipal"),
  AccesorioController.crearAccesorio
);

router.get("/", AccesorioController.obtenerAccesorios);

router.get("/byId/:id", AccesorioController.obtenerAccesorioById);

router.put(
  "/editarAccesorio/:id",
  upload.single("imagenPrincipal"),
  AccesorioController.editarAccesorio
);

router.delete("/:id", AccesorioController.eliminarAccesorio);

module.exports = router;
