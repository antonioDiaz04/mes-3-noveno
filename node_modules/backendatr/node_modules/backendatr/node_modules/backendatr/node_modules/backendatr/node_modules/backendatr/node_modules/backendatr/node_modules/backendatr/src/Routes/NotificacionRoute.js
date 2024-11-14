const express = require("express");
const router = express.Router();

const NotificacionController = require("../Controllers/NotificacionController.js");

router.post("/", NotificacionController.enviarNotificacionyCuerpo);
router.post("/revisar-correo", NotificacionController.enviarNotificacionCorreo);
// router.get("/politicas", CorreoController.obtenerPoliticas);
// router.put("/politica", CorreoController.actualizarPoliticas);

module.exports = router;
