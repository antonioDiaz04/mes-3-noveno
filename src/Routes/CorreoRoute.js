const express = require("express");
const router = express.Router();

const CorreoController = require("../Controllers/CorreoController");

router.post("/", CorreoController.enviarCorreoyCuerpo);
router.post("/code", CorreoController.confirmarVerficacion);
router.post("/verificar-correo", CorreoController.confirmarVerficacionPregunta);
router.post('/verificar-respuesta', CorreoController.verificarRespuestaSecreta);
// router.post("/codeycorreo", CorreoController.confirmarVerficacionCodigoCorreo);
// router.post("/confirmar-usuario", CorreoController.confirmar);
router.post("/activar-cuenta", CorreoController.activarCuenta);

// router.post("/", CorreoController.enviarCorreoyCuerpo);
// router.get("/politicas", CorreoController.obtenerPoliticas);
// router.put("/politica", CorreoController.actualizarPoliticas);

module.exports = router;
