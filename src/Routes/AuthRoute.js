const express = require('express');
const router = express.Router();
const AutController = require("../Controllers/AuthController");

// router.post("/signIn", validarDatos(loginSchema), AutController.Login);
router.post("/signIn", AutController.Login);
router.post("/signIn-Google-Facebook", AutController.signInGoogleFacebook);
router.post("/vincular-Dispositivo-Wear", AutController.vincularDispositivoWear);
router.get("/confirmar-vinculacion/:deviceId", AutController.confirmarVinculacion);
router.get("/generar-Token-Wear/:deviceId", AutController.obtenerTokenPorDeviceId);
// router.post("/enviar-confirmar", AutController.enviarConfirmar);
//autentificacion/signIn-Google-Facebook
// router.post("/verficar-codigo", AutController.verificarCodigo);

module.exports = router;

